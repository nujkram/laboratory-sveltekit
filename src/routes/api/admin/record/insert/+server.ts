import { id } from '$lib/common/utils';
import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { nextCaseNumber } from '$lib/server/caseNumber';
import { cleanBody } from '$lib/server/sanitize';
import { RecordLinkError, validateTransactionLink } from '$lib/server/recordTransaction';

/**
 * Idempotent insert: the client generates `_id` (so an offline entry can be
 * replayed safely). Upsert on `_id` means a duplicate replay is a no-op — no
 * double records. `caseNumber` is always assigned here from an atomic counter
 * (authoritative), so offline entries get their real sequential number at
 * sync time and concurrent inserts can never share a number.
 *
 * `created`/`createdBy` are accepted from the client on purpose: an offline
 * replay must preserve when and by whom the entry was originally made.
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
	// Strip operator/dotted keys and the fields only the server may assign.
	const data = cleanBody(raw, ['_id', 'caseNumber', 'isActive', 'updated', 'updateBy']);

	const db = await clientPromise();
	const Record = db.collection('records');

	// Already synced? (e.g. a retried offline write) — treat as success, don't duplicate.
	const existing = await Record.findOne({ _id });
	if (existing) {
		return json({ status: 'Success', message: 'Record already saved', response: existing });
	}

	// Optional link to the charge slip this result was paid under. Validated
	// before the case number is allocated so a bad link never burns one.
	try {
		data.transactionId = await validateTransactionLink(db, data.transactionId, data.patientId);
	} catch (error) {
		if (error instanceof RecordLinkError) {
			return json({ status: 'Error', message: error.message }, { status: 400 });
		}
		throw error;
	}

	data.caseNumber = await nextCaseNumber(db);

	const created = data.created ? new Date(data.created) : new Date();
	data.created = isNaN(created.getTime()) ? new Date() : created;
	data.createdBy = data.createdBy || locals.user?._id;
	data.isActive = true;

	// $setOnInsert keeps this idempotent even if two replays race past the
	// findOne above: only the first writes; the second matches and sets nothing.
	const response = await Record.updateOne({ _id }, { $setOnInsert: { _id, ...data } }, { upsert: true });

	return json({ status: 'Success', message: 'Record successfully added', response });
}
