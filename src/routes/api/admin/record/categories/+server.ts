import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function GET({request, locals}: any) {
    const db = await clientPromise();
    const Category = db.collection('record_categories');

    const response = await Category.find({}).sort({name: 1}).toArray();

    if(response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                response
            })
        )
    }
}