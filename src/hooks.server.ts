import { redirect } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { dev } from '$app/environment';
import { hashToken, SESSION_COOKIE, SESSION_TTL_MS } from '$lib/server/session';
import { canCallApi, canView, isPublicPath, landingFor } from '$lib/common/access';

export const handle = async ({ event, resolve }: { event: any; resolve: any }) => {
	// Browsers (Chrome DevTools, etc.) probe /.well-known/* automatically.
	// Answer with 204 so it doesn't fall through to a 404 (and skip the DB lookup).
	if (event.url.pathname.startsWith('/.well-known/')) {
		return new Response(null, { status: 204 });
	}

	const token = event.cookies.get(SESSION_COOKIE);

	if (!token) {
		event.locals.user = null;
		const blocked = guardRequest(event);
		if (blocked) return blocked;
		return await resolve(event);
	}

	const db = await clientPromise();
	const Users = db.collection('users');

	// Sessions match by the SHA-256 of the cookie token and must be younger
	// than the TTL. Deactivated accounts fail closed even with a valid token.
	const cutoff = new Date(Date.now() - SESSION_TTL_MS);
	const user = await Users.findOne({
		'services.resume.loginTokens': {
			$elemMatch: { hashedToken: hashToken(token), when: { $gt: cutoff } }
		}
	});

	if (user && user.isActive !== false) {
		event.locals.user = {
			_id: user._id,
			name: user?.profile?.displayName || user?.emails?.[0]?.address,
			email: user?.emails?.[0]?.address,
			profile: user?.profile,
			role: user?.role
		};
	} else {
		event.locals.user = null;
	}

	const blocked = guardRequest(event);
	if (blocked) return blocked;

	return await resolve(event);
};

/**
 * Refuse a page the signed-in user's role may not open, BEFORE any load
 * function runs — so no data for that page is ever fetched, let alone sent.
 * Hiding the sidebar link is cosmetic; this is the part that actually holds.
 *
 * Scoped to page navigations only:
 *  - `/api/*` endpoints carry their own guards and answer with JSON, so a
 *    redirect here would turn a clean 401/403 into an HTML page the client
 *    cannot parse.
 *  - Asset and data requests are left alone.
 *
 * @param {any} event
 */
function guardRequest(event: any): Response | undefined {
	const path = event.url.pathname;

	if (path.startsWith('/api/')) return guardApi(event, path);
	if (path.startsWith('/_app/') || isPublicPath(path)) return;
	// SvelteKit's client-side navigation fetches `__data.json` beside the route;
	// resolve the real route before deciding.
	const route = path.endsWith('/__data.json') ? path.slice(0, -'/__data.json'.length) || '/' : path;
	if (isPublicPath(route)) return;

	if (!event.locals.user) {
		// Unauthenticated: send to sign-in rather than rendering the shell and
		// letting the browser bounce afterwards.
		throw redirect(303, '/auth/login');
	}

	if (!canView(event.locals.user, route)) {
		throw redirect(303, landingFor(event.locals.user));
	}
}

/**
 * The same gate for the JSON API, answering in JSON rather than redirecting —
 * a redirect would hand the client an HTML page it cannot parse.
 *
 * This is a single chokepoint in front of every endpoint, so a new one cannot
 * be shipped unguarded by forgetting the check; `canCallApi` closes anything
 * unlisted to administrators. The per-endpoint guards stay, both as defence in
 * depth and because they give a more specific message.
 *
 * @param {any} event
 * @param {string} path
 */
function guardApi(event: any, path: string): Response | undefined {
	if (canCallApi(event.locals.user, path)) return;

	const signedOut = !event.locals.user;
	// The app's usual envelope, so existing callers (saveOrQueue, the list
	// pages) read the reason instead of choking on an HTML error page.
	return new Response(
		JSON.stringify({
			status: 'Error',
			code: signedOut ? 'AUTH' : 'FORBIDDEN',
			message: signedOut
				? 'Your session has expired. Please sign in again.'
				: 'Your role does not have access to this resource.'
		}),
		{ status: signedOut ? 401 : 403, headers: { 'Content-Type': 'application/json' } }
	);
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error }: { error: any }) {
	console.error('⚡️ Unhandled Error', error);
	console.error('#############################################');

	if (dev) {
		return {
			message: error.message,
			code: error?.code ?? 'UNKNOWN'
		};
	}

	// Never leak internal error details to production users.
	return {
		message: 'An unexpected error occurred. Please try again.',
		code: 'UNKNOWN'
	};
}
