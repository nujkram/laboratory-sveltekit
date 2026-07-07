import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}

	let data;
	try {
		data = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request body.' }, { status: 400 });
	}

	if (!data?._id) {
		return json({ status: 'Error', message: 'Settings id is required.' }, { status: 400 });
	}

	const db = await clientPromise();
	const Setting = db.collection('settings');

	await Setting.updateOne(
		{ _id: data._id },
		{
			$set: {
				name: String(data.name ?? ''),
				location: String(data.location ?? ''),
				mobile: String(data.mobile ?? '')
			}
		}
	);

	return json({ status: 'Success', message: 'Settings updated.' });
}
