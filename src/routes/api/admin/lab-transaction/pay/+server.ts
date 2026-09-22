import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { canTakePayment } from '$lib/common/utils';
import { auditEntry } from '$lib/server/labTransaction';

/**
 * Take payment for a laboratory transaction.
 *
 * DOUBLE-CHARGE PREVENTION is the whole point of this handler, and it is done
 * with a conditional update rather than a read-then-write:
 *
 *   updateOne({ _id, paymentStatus: 'Unpaid' }, { $set: { paymentStatus: 'Paid' } })
 *
 * A single-document update is atomic in MongoDB, so if two cashiers submit at
 * the same moment exactly one matches and the other gets `matchedCount === 0`.
 * We then report 409 with the payment that actually went through, so the second
 * cashier sees who took it and when instead of a generic failure.
 *
 * The O.R. number is TYPED IN, never generated: it comes from the hospital's
 * BIR-controlled receipt booklet. A unique index on `payment.orNumber` catches
 * the same receipt being recorded against two transactions.
 * @type {import('./$types').RequestHandler}
 */

const METHODS = ['Cash', 'Card', 'GCash', 'Cheque'];

export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}
	if (!canTakePayment(locals.user)) {
		return json(
			{ status: 'Error', message: 'Only a cashier or administrator can take payment.' },
			{ status: 403 }
		);
	}

	let raw;
	try {
		raw = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request body.' }, { status: 400 });
	}

	const _id = typeof raw?._id === 'string' ? raw._id : '';
	if (!_id) {
		return json({ status: 'Error', message: 'A transaction id is required.' }, { status: 400 });
	}

	const orNumber = String(raw?.orNumber ?? '').trim();
	if (!orNumber) {
		return json({ status: 'Error', message: 'The O.R. number is required.' }, { status: 400 });
	}

	const method = METHODS.includes(raw?.method) ? raw.method : 'Cash';

	const db = await clientPromise();
	const LabTransaction = db.collection('lab_transactions');

	const current: any = await LabTransaction.findOne({ _id });
	if (!current) {
		return json({ status: 'Error', message: 'Transaction not found.' }, { status: 404 });
	}
	if (current.status === 'Cancelled') {
		return json(
			{ status: 'Error', message: 'That transaction was cancelled and cannot be paid.' },
			{ status: 409 }
		);
	}
	// Reported early for a clear message; the update below is what actually
	// enforces it, so a race that slips past here still cannot double-charge.
	if (current.paymentStatus === 'Paid') {
		return json(
			{ status: 'Conflict', message: alreadyPaid(current), response: current },
			{ status: 409 }
		);
	}

	const netCentavos = Number(current.netCentavos) || 0;

	// Tendered is only meaningful for cash; for the others the exact amount is
	// taken and there is no change to hand back.
	let amountTenderedCentavos = netCentavos;
	if (method === 'Cash' && raw?.amountTenderedCentavos !== undefined && raw?.amountTenderedCentavos !== null) {
		amountTenderedCentavos = Number(raw.amountTenderedCentavos);
		if (!Number.isInteger(amountTenderedCentavos) || amountTenderedCentavos < 0) {
			return json(
				{ status: 'Error', message: 'Amount tendered must be a whole amount of zero or more.' },
				{ status: 400 }
			);
		}
		if (amountTenderedCentavos < netCentavos) {
			return json(
				{ status: 'Error', message: 'Amount tendered is less than the total due.' },
				{ status: 400 }
			);
		}
	}

	const payment = {
		orNumber,
		method,
		amountTenderedCentavos,
		changeCentavos: amountTenderedCentavos - netCentavos,
		paidCentavos: netCentavos,
		paidAt: new Date(),
		paidBy: locals.user._id,
		paidByName: locals.user.name ?? locals.user.profile?.firstName ?? null
	};

	// The filter IS the lock: only an unpaid, uncancelled transaction matches.
	const lock: any = { _id, paymentStatus: 'Unpaid', status: 'Pending' };
	// It also pins the amount. A cashier can apply a senior/PWD discount to an
	// unpaid transaction, so the net read above can change underneath us — and the
	// tendered, change and paid amounts were all computed from it. Pinning turns
	// that race into a 409 telling the cashier to retrieve it again, instead of a
	// payment quietly recorded at the pre-discount total.
	if (typeof current.netCentavos === 'number') lock.netCentavos = current.netCentavos;

	let result;
	try {
		result = await LabTransaction.updateOne(
			lock,
			{
				$set: { paymentStatus: 'Paid', payment, updated: new Date(), updateBy: locals.user._id },
				$push: { history: auditEntry('paid', locals.user, `O.R. ${orNumber}`) as any }
			}
		);
	} catch (error: any) {
		// 11000 on the unique payment.orNumber index — this receipt number is
		// already recorded against another transaction.
		if (error?.code === 11000) {
			const clash: any = await LabTransaction.findOne({ 'payment.orNumber': orNumber });
			return json(
				{
					status: 'Conflict',
					message: `O.R. number ${orNumber} is already recorded against ${
						clash?.referenceNumber ?? 'another transaction'
					}.`
				},
				{ status: 409 }
			);
		}
		throw error;
	}

	if (!result.matchedCount) {
		// Lost the race: the transaction changed between our read and our write.
		const latest: any = await LabTransaction.findOne({ _id });
		if (latest?.paymentStatus === 'Paid') {
			return json(
				{ status: 'Conflict', message: alreadyPaid(latest), response: latest },
				{ status: 409 }
			);
		}
		if (latest?.status === 'Cancelled') {
			return json(
				{
					status: 'Conflict',
					message: 'That transaction was cancelled and cannot be paid.',
					response: latest
				},
				{ status: 409 }
			);
		}
		// The amount moved — someone applied or removed a discount while this
		// cashier was counting the money. Send back the current document so the
		// screen can redraw at the new total rather than re-submitting the old one.
		return json(
			{
				status: 'Conflict',
				message: 'This transaction was repriced while you were taking payment. Please check the new total before charging it.',
				response: latest
			},
			{ status: 409 }
		);
	}

	return json({
		status: 'Success',
		message: 'Payment recorded',
		response: { ...current, paymentStatus: 'Paid', payment, createdBy: current.createdBy }
	});
}

/** @param {any} doc */
function alreadyPaid(doc: any) {
	const who = doc?.payment?.paidByName ? ` by ${doc.payment.paidByName}` : '';
	const when = doc?.payment?.paidAt ? ` on ${new Date(doc.payment.paidAt).toLocaleString()}` : '';
	const or = doc?.payment?.orNumber ? ` under O.R. ${doc.payment.orNumber}` : '';
	return `This transaction was already paid${or}${who}${when}. It cannot be charged again.`;
}
