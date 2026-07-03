import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/**
 * Idempotent insert: the client generates `_id` (so an offline entry can be
 * replayed safely). Upsert on `_id` means a duplicate replay is a no-op — no
 * double records. `caseNumber` is always assigned here (authoritative), so
 * offline entries get their real sequential number at sync time.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, locals }: any) {
    if (!locals?.user) {
        return new Response(
            JSON.stringify({ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' }),
            { status: 401 }
        );
    }
    const data = await request.json();
    const db = await clientPromise();
    const Record = db.collection('records');

    const _id = data._id || id();
    delete data._id;

    // Already synced? (e.g. a retried offline write) — treat as success, don't duplicate.
    const existing = await Record.findOne({ _id });
    if (existing) {
        return new Response(
            JSON.stringify({ status: 'Success', message: 'Record already saved', response: existing })
        );
    }

    // Authoritative sequential case number (ignore any provisional client value).
    const [row] = await Record.aggregate([
        { $group: { _id: null, max: { $max: { $convert: { input: '$caseNumber', to: 'int', onError: 0, onNull: 0 } } } } }
    ]).toArray();
    data.caseNumber = (row?.max || 0) + 1;

    data.created = data.created ? new Date(data.created) : new Date();
    data.createdBy = data.createdBy || locals.user?._id;
    data.isActive = true;

    const response = await Record.updateOne({ _id }, { $setOnInsert: { _id, ...data } }, { upsert: true });

    return new Response(
        JSON.stringify({ status: 'Success', message: 'Record successfully added', response })
    );
}