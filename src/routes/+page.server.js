export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
// @ts-ignore
export async function load({ locals, params, url, parent }) {
	await parent();
	// @ts-ignore
	if (!locals?.user) {
		return;
	};

	// @ts-ignore
	const { user } = locals;


	return {
		user,
	};
}
