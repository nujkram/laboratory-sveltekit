import { dev } from '$app/environment';
import clientPromise from '$lib/server/mongo';
import bcrypt from 'bcryptjs';

const ERROR_TYPES = {
	CREDENTIALS: 'crendentials',
	INVALID: 'invalid'
};

const ERROR_MESSAGES = {
	GENERIC_ERROR: 'Something went wrong.',
	EMPTY_CREDENTIALS: 'Username and password is required.',
	WRONG_CREDENTIALS: 'You have entered the wrong credentials.'
};
/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }: { request: Request; cookies: any }) {
	const data = await request.json();
	const { email, password } = data;

	if (email === '' || password === '') {
		return new Response(
			JSON.stringify({
				error: true,
				errorType: ERROR_TYPES.CREDENTIALS,
				errorMessage: ERROR_MESSAGES.EMPTY_CREDENTIALS
			}),
			{ status: 400 }
		);
	}

	const db = await clientPromise();
	const Users = db.collection('users');

	const user = await Users.findOne({ 'emails.address': email });

	if (!user) {
		return new Response(
			JSON.stringify({
				error: true,
				errorType: ERROR_TYPES.CREDENTIALS,
				errorMessage: ERROR_MESSAGES.WRONG_CREDENTIALS
			}),
			{ status: 400 }
		);
	}

	const passwordMatches = await bcrypt.compare(password, user?.services?.password?.bcrypt);

	if (!passwordMatches) {
		return new Response(
			JSON.stringify({
				error: true,
				errorType: ERROR_TYPES.CREDENTIALS,
				errorMessage: ERROR_MESSAGES.WRONG_CREDENTIALS
			}),
			{ status: 400 }
		);
	}

	const userAuthToken = crypto.randomUUID();

	await Users.updateOne(
		{ _id: user._id },
		{
			$addToSet: { 'services.resume.loginTokens': { when: new Date(), hashedToken: userAuthToken } }
		}
	);

	cookies.set('meteor_login_token', userAuthToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		maxAge: 1000 * 60 * 60 * 24 * 90
	});

	return new Response(JSON.stringify({ error: false, user }), { status: 200 });
}
