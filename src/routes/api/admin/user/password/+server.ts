import clientPromise from '$lib/server/mongo';
import { hashPassword } from '$lib/common/utils';
import bcrypt from 'bcryptjs';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return new Response(JSON.stringify({ error: true, message: 'Invalid access.' }), { status: 401 });
	}

	const { currentPassword, newPassword } = await request.json();

	if (!currentPassword || !newPassword) {
		return new Response(
			JSON.stringify({ error: true, message: 'Current and new password are required.' }),
			{ status: 400 }
		);
	}

	const db = await clientPromise();
	const Users = db.collection('users');

	const user = await Users.findOne({ _id: locals.user._id });

	if (!user) {
		return new Response(JSON.stringify({ error: true, message: 'User not found.' }), { status: 404 });
	}

	const passwordMatches = await bcrypt.compare(currentPassword, user?.services?.password?.bcrypt);

	if (!passwordMatches) {
		return new Response(
			JSON.stringify({ error: true, message: 'Your current password is incorrect.' }),
			{ status: 400 }
		);
	}

	await Users.updateOne(
		{ _id: user._id },
		{ $set: { 'services.password.bcrypt': await hashPassword(newPassword) } }
	);

	return new Response(
		JSON.stringify({ error: false, message: 'Your password has been updated.' }),
		{ headers: { 'content-type': 'application/json' }, status: 200 }
	);
}
