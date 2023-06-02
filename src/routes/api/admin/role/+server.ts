import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function GET({request, locals}: any) {
    const db = await clientPromise();
    const Role = db.collection('roles');

    const response = await Role.find({}).sort({name: 1}).toArray();

    if(response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                response
            })
        )
    }
}