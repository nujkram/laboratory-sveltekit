import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({request, locals}: any) {
    const data = await request.json();
    const db = await clientPromise();
    const Record = db.collection('records');
    data.updated = new Date();
    data.updateBy = locals.user._id;    
    data.isActive = true;
    let _id = data.recordId;
    delete data.recordId
    console.log('data', data);
    const response = await Record.updateOne(
        { _id },
        {
            $set: {...data}
        }
    );
    console.log('response', response);
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