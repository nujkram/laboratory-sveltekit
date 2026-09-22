import { json } from '@sveltejs/kit';
import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';
import { nextTransactionNumber } from '$lib/server/transactionNumber';
import { formatReference } from '$lib/common/labReference';
import { auditEntry, priceTransaction, PricingError } from '$lib/server/labTransaction';
import { calculateAge } from '$lib/utils/ageHelper';

/**
 * Create a laboratory transaction from a request.
 *
 * The client posts only who the tests are for and which codes/quantities were
 * chosen. Every amount is computed here from `lab_tests` — a posted price is
 * never read, so the totals cannot be tampered with.
 *
 * This endpoint is deliberately NOT offline-capable (no `saveOrQueue`). The
 * reference number is allocated from an atomic counter and printed on a receipt
 * the customer physically carries to the cashier, so it can only ever be a
 * number the server actually issued — a provisional one would be worthless.
 *
 * A client-supplied `_id` still makes the create idempotent, so a double-click
 * or a retried request cannot mint two transactions (and two reference numbers)
 * for one request.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}

	let raw;
	try {
		raw = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request body.' }, { status: 400 });
	}

	const _id = typeof raw?._id === 'string' && raw._id ? raw._id : id();

	const db = await clientPromise();
	const LabTransaction = db.collection('lab_transactions');

	// Already created? (double submit / retry) — return it, don't mint a second.
	const existing = await LabTransaction.findOne({ _id });
	if (existing) {
		return json({ status: 'Success', message: 'Transaction already saved', response: existing });
	}

	const created = new Date();

	// Who the tests are for: an existing patient, or a walk-in typed by hand.
	let patientId: string | null = null;
	let customer: Record<string, any>;

	if (raw?.patientId) {
		const patient: any = await db.collection('patients').findOne({ _id: raw.patientId });
		if (!patient) {
			return json({ status: 'Error', message: 'That patient no longer exists.' }, { status: 400 });
		}
		patientId = patient._id;
		customer = {
			name: patient.completeName ?? '',
			sex: patient.gender ?? '',
			birthDate: patient.birthDate ?? null,
			age: patient.birthDate ? calculateAge(patient.birthDate, created) : null,
			address: patient.address ?? ''
		};
	} else {
		const name = String(raw?.customer?.name ?? '').trim();
		if (!name) {
			return json(
				{ status: 'Error', message: 'A patient or customer name is required.' },
				{ status: 400 }
			);
		}
		const age = raw?.customer?.age === '' || raw?.customer?.age == null ? null : Number(raw.customer.age);
		customer = {
			name,
			sex: String(raw?.customer?.sex ?? '').trim(),
			birthDate: null,
			age: Number.isFinite(age as number) ? age : null,
			address: String(raw?.customer?.address ?? '').trim()
		};
	}

	// Server-authoritative pricing.
	let priced;
	try {
		priced = await priceTransaction(db, raw?.items, raw?.discount);
	} catch (error) {
		if (error instanceof PricingError) {
			return json({ status: 'Error', message: error.message }, { status: 400 });
		}
		throw error;
	}

	const transactionNo = await nextTransactionNumber(db);

	const doc = {
		_id,
		transactionNo,
		referenceNumber: formatReference(transactionNo),
		patientId,
		customer,
		requestedBy: String(raw?.requestedBy ?? '').trim(),
		items: priced.items,
		grossCentavos: priced.grossCentavos,
		// The whole resolved discount at once — type, amount, reason and the
		// captured senior/PWD ID. The cashier's discount endpoint `$set`s the same
		// object, so the two writers cannot drift. Note the reason is DERIVED for a
		// statutory discount: a client-supplied string no longer reaches the
		// printed slip.
		...priced.discount,
		netCentavos: priced.netCentavos,
		status: 'Pending',
		paymentStatus: 'Unpaid',
		payment: null,
		remarks: String(raw?.remarks ?? '').trim(),
		history: [auditEntry('created', locals.user)],
		created,
		createdBy: locals.user._id,
		isActive: true
	};

	// $setOnInsert keeps this idempotent even if two requests race past the
	// findOne above: only the first writes; the second matches and sets nothing.
	await LabTransaction.updateOne({ _id }, { $setOnInsert: doc }, { upsert: true });

	// Hand back the same shape the read endpoints do, with `createdBy` joined
	// rather than a bare id, so the caller can print the slip (which names the
	// encoder) straight from this response without a second fetch. The stored
	// document keeps the id.
	return json({
		status: 'Success',
		message: 'Laboratory transaction created',
		response: { ...doc, createdBy: locals.user }
	});
}
