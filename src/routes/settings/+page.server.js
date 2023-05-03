import clientPromise from '$lib/server/mongo';
export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {

    const db = await clientPromise();
	const Setting = db.collection('settings');

    const settings = await Setting.findOne({});

	// @ts-ignore
	const { user } = locals;

	return {
		user,
        settings
	};
}
