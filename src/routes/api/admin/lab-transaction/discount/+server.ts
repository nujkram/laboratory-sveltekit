import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { canTakePayment } from '$lib/common/utils';
import { auditEntry } from '$lib/server/labTransaction';
import { resolveDiscount } from '$lib/common/discounts';

/**
 * Set the discount on an unpaid laboratory transaction.
 *
 * SET, not apply: posting `type: 'None'` is how a discount is removed again,
 * which is what happens when a customer says they have a senior card and then
 * cannot produce it. There is one code path for granting, correcting and
 * removing, so all three leave the same audit trail.
 *
 * This exists because the counter is where the ID card is physically handed
 * over. The encoder can set a discount at request time, but the cashier is the
 * one looking at the card, so the cashier can set or correct it right up until
 * payment — and never after: a discount on a paid transaction is a refund, which
 * is different paperwork, not an edit.
 *
 * The amount is recomputed from the transaction's STORED `grossCentavos`, not by
 * re-reading `lab_tests`. `items[]` is the snapshot of what the customer was
 * quoted; if an administrator has since edited the catalog, discounting that
 * quote is right and re-quoting it is not.
 *
 * Deliberately NOT offline-capable, like the rest of this module: a queued
 * discount would let a slip print at a total the server never agreed to.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}
	// Defence in depth: access.ts already gates this path at the hook, but
	// `pay` does not lean on that alone and neither does this.
	if (!canTakePayment(locals.user)) {
		return json(
			{ status: 'Error', message: 'Only a cashier or administrator can change a discount.' },
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

	const db = await clientPromise();
	const LabTransaction = db.collection('lab_transactions');

	const current: any = await LabTransaction.findOne({ _id });
	if (!current) {
		return json({ status: 'Error', message: 'Transaction not found.' }, { status: 404 });
	}

	// Reported early for a clear message; the update filter below is what actually
	// enforces both of these, so a race that slips past here still cannot reprice
	// a settled transaction.
	if (current.status === 'Cancelled') {
		return json(
			{ status: 'Error', message: 'That transaction was cancelled and cannot be repriced.' },
			{ status: 409 }
		);
	}
	if (current.paymentStatus === 'Paid') {
		return json(
			{ status: 'Conflict', message: alreadyPaid(current), response: current },
			{ status: 409 }
		);
	}

	const grossCentavos = Number(current.grossCentavos);
	if (!Number.isSafeInteger(grossCentavos) || grossCentavos < 0) {
		return json(
			{ status: 'Error', message: 'That transaction has no valid gross amount.' },
			{ status: 409 }
		);
	}

	const resolved = resolveDiscount(grossCentavos, raw?.discount ?? {});
	if (!resolved.ok) {
		return json({ status: 'Error', message: resolved.message, field: resolved.field }, { status: 400 });
	}

	const removing = resolved.value.discountType === 'None';
	const note = removing ? 'Discount removed' : resolved.value.discountReason;

	const result = await LabTransaction.findOneAndUpdate(
		// The filter IS the lock, and it pins the gross as a compare-and-swap.
		// Nothing edits a transaction's items today, so that pin is currently a
		// no-op — but the day an edit-items endpoint appears, this handler still
		// physically cannot write a netCentavos derived from a stale gross.
		{ _id, status: 'Pending', paymentStatus: 'Unpaid', grossCentavos },
		{
			$set: {
				...resolved.value,
				netCentavos: grossCentavos - resolved.value.discountCentavos,
				updated: new Date(),
				updateBy: locals.user._id
			},
			$push: {
				history: auditEntry(
					removing ? 'discount-removed' : 'discount-applied',
					locals.user,
					note
				) as any
			}
		},
		{ returnDocument: 'after' }
	);

	// mongodb driver v4 wraps the document in `.value`. A v6 upgrade returns the
	// document itself and would silently make this undefined — the same trap
	// documented in $lib/server/transactionNumber.
	const updated: any = result?.value;

	if (!updated) {
		const latest: any = await LabTransaction.findOne({ _id });
		if (!latest) {
			return json({ status: 'Error', message: 'Transaction not found.' }, { status: 404 });
		}
		const why =
			latest.paymentStatus === 'Paid'
				? alreadyPaid(latest)
				: latest.status === 'Cancelled'
				? 'That transaction was cancelled and cannot be repriced.'
				: 'That transaction changed while you were editing it. Please retrieve it again.';
		return json({ status: 'Conflict', message: why, response: latest }, { status: 409 });
	}

	return json({
		status: 'Success',
		message: removing ? 'Discount removed' : 'Discount applied',
		// Keep the `createdBy` the caller already had: this write returns the bare
		// stored id, and the cashier screen prints a slip that names the encoder.
		response: { ...updated, createdBy: current.createdBy }
	});
}

/** @param {any} doc */
function alreadyPaid(doc: any) {
	const or = doc?.payment?.orNumber ? ` under O.R. ${doc.payment.orNumber}` : '';
	return `This transaction was already paid${or}. A discount after payment is a refund, not an edit.`;
}
