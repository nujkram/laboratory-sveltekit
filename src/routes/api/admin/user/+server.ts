import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function GET({request, locals}: any) {
    const db = await clientPromise();
    const User = db.collection('users');

    // The list is for the admin's browser: never ship password hashes or
    // session tokens with it.
    const response = await User.find({}, { projection: { services: 0 } })
        .sort({ created: -1 })
        .toArray();

    if(response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                response
            })
        )
    }
}