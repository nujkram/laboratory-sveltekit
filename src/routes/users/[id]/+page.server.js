import clientPromise from '$lib/server/mongo';
import { error } from '@sveltejs/kit';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	// @ts-ignore
	if (!locals?.user) {
		throw error(401, 'You must be signed in to view this page.');
	}

	const { id } = params;
	const db = await clientPromise();
	const Users = db.collection('users');

	const user = await Users.findOne(
		{ _id: id },
		{ projection: { 'services.password': 0, 'services.resume': 0 } }
	);

	if (!user) {
		throw error(404, 'User not found.');
	}

	return { profileUser: JSON.parse(JSON.stringify(user)) };
}
