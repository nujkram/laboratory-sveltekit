import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    const {patientId} = params;
    const db = await clientPromise();
    const Patient = db.collection('patients');

    const patient = await Patient.findOne({_id: patientId});

    return {patient};
}
