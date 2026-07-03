export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
// @ts-ignore
export async function load({ locals, params, url, parent, fetch }) {
	await parent();
	// @ts-ignore
	if (!locals?.user) {
		return;
	};

	// @ts-ignore
	const { user } = locals;

	async function fetchData(path) {
		try {
			let response = await fetch(path, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			let result = await response.json();
			return result.response;
		} catch (error) {
			console.error('error', error);
		}
	}

	// One summary call — counts and tallies are computed in the database instead
	// of downloading every user/patient/record to count them client-side.
	const summary = await fetchData('/api/admin/dashboard');

	return {
		user,
		summary
	};
}
