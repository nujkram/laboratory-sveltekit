import { json } from '@sveltejs/kit';
import { id, hashPassword, isAdmin } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!isAdmin(locals?.user)) {
		return json(
			{ status: 'Error', message: 'Only administrators can create users.' },
			{ status: 403 }
		);
	}

	let data;
	try {
		data = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request body.' }, { status: 400 });
	}

	for (const field of ['firstName', 'lastName', 'email', 'password', 'role']) {
		if (typeof data?.[field] !== 'string' || !data[field].trim()) {
			return json({ status: 'Error', message: `${field} is required.` }, { status: 400 });
		}
	}

	const db = await clientPromise();
	const User = db.collection('users');

	// Backstop against duplicate accounts (e.g. a double-submit or a retried
	// request): a username — and, when given, an email — must be unique. The
	// unique index on emails.address (see mongo.ts) catches the race this
	// check-then-insert leaves open.
	const orClauses: any[] = [{ 'emails.address': data.email }];
	if (data.username) orClauses.push({ username: data.username });
	const existing = await User.findOne({ $or: orClauses });
	if (existing) {
		return json(
			{ status: 'Error', message: 'A user with that username or email already exists.' },
			{ status: 409 }
		);
	}

	const fullName = `${data.firstName} ${data.lastName}`.trim();
	const profile = {
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
		photo: ''
	};

	const user = {
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
		role: data.role
	};

	try {
		const response = await User.insertOne(user as any);
		return json({ status: 'Success', response });
	} catch (error: any) {
		if (error?.code === 11000) {
			return json(
				{ status: 'Error', message: 'A user with that username or email already exists.' },
				{ status: 409 }
			);
		}
		throw error;
	}
}
