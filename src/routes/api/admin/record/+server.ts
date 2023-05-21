import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({request}: any) {
    const data = await request.json();
    let {patientId} = data;
    const db = await clientPromise();
    const Record = db.collection('records');

    const pipeline = [
        {
            $match: { patientId: patientId }
        },
        {
            $lookup: {
                from: 'patients',
                localField: 'patientId',
                foreignField: '_id',
                as: 'patient'
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'medicalTechnologist',
                foreignField: '_id',
                as: 'medicalTechnologist'
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'pathologist',
                foreignField: '_id',
                as: 'pathologist'
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy'
            },
        },
        {
            $unwind: {
                path: '$patient',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$medicalTechnologist',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$pathologist',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$createdBy',
                preserveNullAndEmptyArrays: true
            }
        }
    ]
    const response = await Record.aggregate(pipeline).toArray();

    if(response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                response
            })
        )
    }
}