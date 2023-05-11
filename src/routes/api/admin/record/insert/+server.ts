import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({request, locals}: any) {
    const data = await request.json();
    const db = await clientPromise();
    const Record = db.collection('records');
    data._id = id();
    data.created = new Date();
    data.createdBy = locals.user._id;    
    data.isActive = true;
    const response = await Record.insertOne(data);

    if(response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                message: 'Record successfully added',
                response
            })
        )
    }
}