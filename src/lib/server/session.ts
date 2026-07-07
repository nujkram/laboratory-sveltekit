import { createHash } from 'node:crypto';

export const SESSION_COOKIE = 'meteor_login_token';

// Sessions live this long — enforced in three places that must agree: the
// cookie maxAge, the `when` cutoff in hooks.server.ts, and the prune on login.
export const SESSION_TTL_DAYS = 90;
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

// The cookie holds the raw token; the database stores only its SHA-256
// (base64, the same encoding Meteor's accounts system uses for this field),
// so a leaked users collection does not hand out live sessions.
export const hashToken = (token: string) => createHash('sha256').update(token).digest('base64');

export const sessionCookieOptions = (dev: boolean) => ({
	path: '/',
	httpOnly: true,
	sameSite: 'strict' as const,
	secure: !dev,
	// maxAge is in seconds — not milliseconds.
	maxAge: SESSION_TTL_DAYS * 24 * 60 * 60
});
