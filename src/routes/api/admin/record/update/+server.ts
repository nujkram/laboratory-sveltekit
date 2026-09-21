import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { cleanBody } from '$lib/server/sanitize';
import { RecordLinkError, validateTransactionLink } from '$lib/server/recordTransaction';

/**
 * Fields the client can never overwrite through an update — identity,
 * provenance, and the server-assigned case number.
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

	const _id = raw?.recordId;
	if (typeof _id !== 'string' || !_id) {
		return json({ status: 'Error', message: 'Record id is required.' }, { status: 400 });
	}

	const baseUpdated = raw?.baseUpdated; // version the edit was made from
	const force = raw?.force; // set by "Keep mine" to overwrite

	const data = cleanBody(raw, [
		'recordId',
		'_id',
		'baseUpdated',
		'force',
		'caseNumber',
		'patientId',
		'created',
		'createdBy',
		'updated',
		'updateBy',
		'isActive'
	]);

	const db = await clientPromise();
	const Record = db.collection('records');

	// The charge-slip link may be changed or cleared here. `patientId` is a
	// protected field, so the owning patient comes from the stored record
	// rather than the request — a body cannot claim a different one.
	if ('transactionId' in data) {
		const existing: any = await Record.findOne({ _id }, { projection: { patientId: 1 } });
		try {
			data.transactionId = await validateTransactionLink(db, data.transactionId, existing?.patientId);
		} catch (error) {
			if (error instanceof RecordLinkError) {
				return json({ status: 'Error', message: error.message }, { status: 400 });
			}
			throw error;
		}
	}

	data.updated = new Date();
	data.updateBy = locals.user._id;
	data.isActive = true;

	// Optimistic concurrency, atomically: the update only matches if the record
	// still carries the exact `updated` stamp this edit was made from (or has
	// never been updated, when baseUpdated is null). No check-then-write gap —
	// two devices racing here means exactly one wins and the other gets a 409.
	const filter: any = { _id };
	if (!force) {
		filter.updated = baseUpdated ? new Date(baseUpdated) : { $exists: false };
	}

	const response = await Record.updateOne(filter, { $set: { ...data } });

	if (response.matchedCount === 0) {
		const exists = await Record.findOne({ _id }, { projection: { _id: 1 } });
		if (exists) {
			return json(
				{ status: 'Conflict', message: 'This record was changed on another device since you edited it.' },
				{ status: 409 }
			);
		}
		return json({ status: 'Error', message: 'Record not found.' }, { status: 404 });
	}

	return json({ status: 'Success', message: 'Record successfully updated.', response });
}
