import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({request, locals}: any) {
    if (!locals?.user) {
        return new Response(
            JSON.stringify({ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' }),
            { status: 401 }
        );
    }
    const data = await request.json();
    const db = await clientPromise();
    const Record = db.collection('records');

    const _id = data.recordId;
    const baseUpdated = data.baseUpdated; // version the edit was made from
    const force = data.force;             // set by "Keep mine" to overwrite
    delete data.recordId;
    delete data._id;
    delete data.baseUpdated;
    delete data.force;

    // Conflict: the record changed on another device since this edit was made.
    if (!force && baseUpdated) {
        const existing = await Record.findOne({ _id });
        if (existing?.updated && new Date(existing.updated).getTime() > new Date(baseUpdated).getTime()) {
            return new Response(
                JSON.stringify({ status: 'Conflict', message: 'This record was changed on another device since you edited it.' }),
                { status: 409 }
            );
        }
    }

    data.updated = new Date();
    data.updateBy = locals.user._id;
    data.isActive = true;
    const response = await Record.updateOne(
        { _id },
        {
            $set: {...data}
        }
    );
    if(response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                message: 'Record successfully updated.',
                response
            })
        )
    }
}