import clientPromise from '$lib/server/mongo';
export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {

    const db = await clientPromise();
	const User = db.collection('users');

    const users = await User.find({}).toArray();

	// @ts-ignore
	const { user } = locals;

	return {
		user,
        users
	};
}
