import clientPromise from '$lib/server/mongo';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    const {patientId} = params;
    const db = await clientPromise();
    const User = db.collection('users');

    const medTechs = await User.find({role: 'Medical Technologist'}).sort({created: -1}).toArray();
    const pathologists = await User.find({role: 'Pathologist'}).sort({created: -1}).toArray();

    return {patientId, medTechs, pathologists};
}

