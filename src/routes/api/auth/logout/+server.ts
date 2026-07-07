import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { hashToken, sessionCookieOptions, SESSION_COOKIE } from '$lib/server/session';

/**
 * POST (not GET) so link preloading can never log a user out, and the
 * session token is revoked server-side — clearing the cookie alone would
 * leave the token valid in the database.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ cookies, locals }: any) {
	const token = cookies.get(SESSION_COOKIE);

	if (token) {
		const db = await clientPromise();
		await db
			.collection('users')
			.updateMany({ 'services.resume.loginTokens.hashedToken': hashToken(token) }, {
				$pull: { 'services.resume.loginTokens': { hashedToken: hashToken(token) } }
			} as any);
	}

	cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(dev), maxAge: 0 });
	locals.user = null;

	return json({ error: false });
}
