import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    let caseNumber;
    const {patientId} = params;
    const db = await clientPromise();
    const Record = db.collection('records');
  
    const lastDocument = await Record
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .next();

    if (!lastDocument) {
      // No documents found in the collection
      caseNumber = 1; // Set a default number if needed
    }
  
    caseNumber = parseInt(lastDocument['caseNumber']) + 1;

    const User = db.collection('users');

    const medTechs = await User.find({role: 'Medical Technologist'}).sort({created: -1}).toArray();
    const pathologists = await User.find({role: 'Pathologist'}).sort({created: -1}).toArray();

    return {patientId, medTechs, pathologists, caseNumber};
}

