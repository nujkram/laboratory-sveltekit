import { id, hashPassword } from '$lib/common/utils';
import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	const data = await request.json();
	const db = await clientPromise();
	const User = db.collection('users');
	let profile = {
		firstName: data.firstName,
		middleName: data.middleName,
		lastName: data.lastName,
		displayName: `${data.firstName} ${data.lastName}`,
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
