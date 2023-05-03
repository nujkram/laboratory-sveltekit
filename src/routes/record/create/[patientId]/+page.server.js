export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    const {patientId} = params;
    
    return {patientId};
}

