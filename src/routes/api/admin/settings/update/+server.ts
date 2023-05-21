import clientPromise from "$lib/server/mongo";

/** @type {import('./$types').RequestHandler} */
export async function POST({request, locals}: any) {
    if(!locals?.user) {
		return new Response(JSON.stringify({ messsage:'Invalid access.' }), { status: 200 });
	}

    const data  = await request.json();
    const db = await clientPromise();
    const Setting = db.collection('settings');

    const settings = await Setting.updateOne(
        { _id: data._id },
        {
            $set: {
                'name': data.name,
                'location': data.location,
                'mobile': data.mobile,
            }
        }
    )

    return new Response(JSON.stringify({success: true, message: 'Record Updated'}), {headers: {'content-type': 'application/json'}, status: 200})
}