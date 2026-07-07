import { id, hashPassword, isAdmin } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!isAdmin(locals?.user)) {
		return new Response(
			JSON.stringify({ status: 'Error', message: 'Only administrators can create users.' }),
			{ status: 403 }
		);
	}

	const data = await request.json();
	const db = await clientPromise();
	const User = db.collection('users');

	// Backstop against duplicate accounts (e.g. a double-submit or a retried
	// request): a username — and, when given, an email — must be unique.
	const orClauses: any[] = [];
	if (data.username) orClauses.push({ username: data.username });
	if (data.email) orClauses.push({ 'emails.address': data.email });
	if (orClauses.length) {
		const existing = await User.findOne({ $or: orClauses });
		if (existing) {
			return new Response(
				JSON.stringify({
					status: 'Error',
					message: 'A user with that username or email already exists.'
				}),
				{ status: 409 }
			);
		}
	}

	const fullName = `${data.firstName} ${data.lastName}`.trim();
	let profile = {
		firstName: data.firstName,
		middleName: data.middleName,
		lastName: data.lastName,
		title: data.title || '',
		// Credentials (MD, FPSP, RMT, DTA…) are appended so reports show them after the name.
		displayName: data.title ? `${fullName}, ${data.title}` : fullName,
		phone: data.phone,
		country: data.country,
		province: data.province,
		email: data.email,
		photo: ""
	}

	let user = {
		_id: id(),
		createdAt: new Date(),
		services: {
			password: {
				bcrypt: await hashPassword(data.password)
			},
			resume: {
				loginTokens: []
			}
		},
		emails: [
			{
				address: data.email,
				verified: true
			}
		],
		license: data.license,
		profile: profile,
		isActive: true,
		isFake: false,
		role: data.role,
	}
	
	const response = await User.insertOne(user);
	if (response) {
		return new Response(
			JSON.stringify({
				status: 'Success',
				response
			})
		);
	}
}
