export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {

	// @ts-ignore
	const { user } = locals;

	return {
		user,
	};
}
