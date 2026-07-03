import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/**
 * Idempotent insert: client may supply `_id`/`created`/`createdBy` (offline entry),
 * and a replay of the same `_id` is a no-op — no duplicate patients.
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
    const Patient = db.collection('patients');

    const _id = data._id || id();
    delete data._id;

    const existing = await Patient.findOne({ _id });
    if (existing) {
        return new Response(
            JSON.stringify({ status: 'Success', message: 'Patient already saved', response: existing })
        );
    }

    data.middleName = data?.middleName || '';
    data.completeName = data.middleName
        ? `${data.firstName} ${data.middleName} ${data.lastName}`
        : `${data.firstName} ${data.lastName}`;
    data.created = data.created ? new Date(data.created) : new Date();
    data.createdBy = data.createdBy || locals.user?._id;
    data.isActive = true;

    const response = await Patient.updateOne({ _id }, { $setOnInsert: { _id, ...data } }, { upsert: true });
    return new Response(
        JSON.stringify({ status: 'Success', message: 'Patient successfully added', response })
    );
}