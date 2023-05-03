import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ locals }: any) => {
	if(!locals?.user) {
		return {}
	}

    return {
		user: locals?.user,
	};
};
