import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    const {recordId} = params;
    const db = await clientPromise();
    const User = db.collection('users');
    const Record = db.collection('records');

    const medTechs = await User.find({role: 'Medical Technologist'}).sort({created: -1}).toArray();
    const pathologists = await User.find({role: 'Pathologist'}).sort({created: -1}).toArray();


    const pipeline = [
        {
            $match: { _id: recordId }
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
        }
    ]

    const [record] = await Record.aggregate(pipeline).toArray();
    
    return {recordId, record, medTechs, pathologists};
}

