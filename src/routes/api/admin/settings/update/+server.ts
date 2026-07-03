import clientPromise from "$lib/server/mongo";

/** @type {import('./$types').RequestHandler} */
export async function POST({request, locals}: any) {
    if(!locals?.user) {
		return new Response(
			JSON.stringify({ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' }),
			{ status: 401 }
		);
	}

    const data  = await request.json();
    const db = await clientPromise();
    const Setting = db.collection('settings');

    await Setting.updateOne(
        { _id: data._id },
        {
            $set: {
                'name': data.name,
                'location': data.location,
                'mobile': data.mobile,
            }
        }
    )

    return new Response(JSON.stringify({ status: 'Success', message: 'Settings updated.' }), {headers: {'content-type': 'application/json'}, status: 200})
}