import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    const {patientId} = params;
    const db = await clientPromise();
    const Patient = db.collection('patients');

    const pipeline = [
      {
        $match: { _id: patientId }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      {
        $unwind: {
          path: '$createdBy',
          preserveNullAndEmptyArrays: true
        }
      }
    ];
    
    const [patient] = await Patient.aggregate(pipeline).toArray();

    return {patient};
}
