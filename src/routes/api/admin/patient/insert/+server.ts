import { id } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({request, locals}: any) {
    const data = await request.json();
    const db = await clientPromise();
    const Patient = db.collection('patients');
    data._id = id();
    data.completeName = `${data.firstName} ${data.lastName}`;
    if(data.middleName)
        data.completeName = `${data.firstName} ${data.middleName || ''} ${data.lastName}`;
    data.middleName = data?.middleName || '';
    data.isActive = true;
    
    const response = await Patient.insertOne(data);
    if(response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                message: 'Patient successfully added',
                response
            })
        )
    }
}