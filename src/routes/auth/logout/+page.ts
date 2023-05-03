import { browser } from '$app/environment';
import type { PageServerLoad } from './$types';

function removeCookieByName(name) {
	document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export const load: PageServerLoad = async () => {
	if (browser) {
		removeCookieByName('meteor_login_token');
		// hard load home page
		window.location.href = '/';
	}
};
