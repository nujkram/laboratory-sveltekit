import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import bcrypt from 'bcryptjs';
import {
	hashToken,
	sessionCookieOptions,
	SESSION_COOKIE,
	SESSION_TTL_MS
} from '$lib/server/session';

const ERROR_TYPES = {
	CREDENTIALS: 'crendentials',
	INVALID: 'invalid'
};

const ERROR_MESSAGES = {
	GENERIC_ERROR: 'Something went wrong.',
	EMPTY_CREDENTIALS: 'Username and password is required.',
	WRONG_CREDENTIALS: 'You have entered the wrong credentials.',
	DEACTIVATED: 'Your account has been deactivated. Contact your administrator.',
	TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please try again in a few minutes.'
};

// Keep only the most recent sessions per user so the array can't grow forever.
const MAX_SESSIONS_PER_USER = 20;

// Basic brute-force protection: after MAX_FAILURES failed attempts for the
// same IP+email within WINDOW_MS, reject before touching bcrypt. In-memory,
// so it resets on redeploy and is per-instance on serverless — a backstop,
// not a substitute for infrastructure-level rate limiting.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map<string, { count: number; first: number }>();

function tooManyFailures(key: string) {
	const entry = failures.get(key);
	if (!entry) return false;
	if (Date.now() - entry.first > WINDOW_MS) {
		failures.delete(key);
		return false;
	}
	return entry.count >= MAX_FAILURES;
}

function recordFailure(key: string) {
	if (failures.size > 1000) {
		for (const [k, v] of failures) if (Date.now() - v.first > WINDOW_MS) failures.delete(k);
	}
	const entry = failures.get(key);
	if (!entry || Date.now() - entry.first > WINDOW_MS) {
		failures.set(key, { count: 1, first: Date.now() });
	} else {
		entry.count += 1;
	}
}

const credentialsError = (message: string, status = 400) =>
	json({ error: true, errorType: ERROR_TYPES.CREDENTIALS, errorMessage: message }, { status });

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies, getClientAddress }: any) {
	let data;
	try {
		data = await request.json();
	} catch {
		return credentialsError(ERROR_MESSAGES.EMPTY_CREDENTIALS);
	}
	const { email, password } = data ?? {};

	if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
		return credentialsError(ERROR_MESSAGES.EMPTY_CREDENTIALS);
	}

	const limiterKey = `${getClientAddress?.() ?? ''}:${email.toLowerCase()}`;
	if (tooManyFailures(limiterKey)) {
		return credentialsError(ERROR_MESSAGES.TOO_MANY_ATTEMPTS, 429);
	}

	const db = await clientPromise();
	const Users = db.collection('users');

	const user = await Users.findOne({ 'emails.address': email });
	const storedHash = user?.services?.password?.bcrypt;

	if (!user || !storedHash || !(await bcrypt.compare(password, storedHash))) {
		recordFailure(limiterKey);
		return credentialsError(ERROR_MESSAGES.WRONG_CREDENTIALS);
	}

	// Checked after the password so only the account's owner learns its status.
	if (user.isActive === false) {
		return credentialsError(ERROR_MESSAGES.DEACTIVATED, 403);
	}

	failures.delete(limiterKey);

	const token = crypto.randomUUID();
	const now = new Date();
	const cutoff = new Date(now.getTime() - SESSION_TTL_MS);

	// Prune expired sessions, then store the new one (hashed — never the raw
	// token). Two updates because $pull and $push can't target the same field.
	await Users.updateOne(
		{ _id: user._id },
		{ $pull: { 'services.resume.loginTokens': { when: { $lt: cutoff } } } }
	);
	await Users.updateOne(
		{ _id: user._id },
		{
			$push: {
				'services.resume.loginTokens': {
					$each: [{ when: now, hashedToken: hashToken(token) }],
					$slice: -MAX_SESSIONS_PER_USER
				}
			}
		}
	);

	cookies.set(SESSION_COOKIE, token, sessionCookieOptions(dev));

	// Only what the client needs — never the password hash or session tokens.
	return json({
		error: false,
		user: {
			_id: user._id,
			email: user.emails?.[0]?.address,
			role: user.role,
			profile: user.profile
		}
	});
}
