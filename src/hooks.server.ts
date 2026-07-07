import clientPromise from '$lib/server/mongo';
import { dev } from '$app/environment';
import { hashToken, SESSION_COOKIE, SESSION_TTL_MS } from '$lib/server/session';

export const handle = async ({ event, resolve }: { event: any; resolve: any }) => {
	// Browsers (Chrome DevTools, etc.) probe /.well-known/* automatically.
	// Answer with 204 so it doesn't fall through to a 404 (and skip the DB lookup).
	if (event.url.pathname.startsWith('/.well-known/')) {
		return new Response(null, { status: 204 });
	}

	const token = event.cookies.get(SESSION_COOKIE);

	if (!token) {
		event.locals.user = null;
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

	return await resolve(event);
};

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
