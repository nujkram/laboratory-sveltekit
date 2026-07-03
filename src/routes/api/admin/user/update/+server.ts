import clientPromise from '$lib/server/mongo';
import { hashPassword, isAdmin } from '$lib/common/utils';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!isAdmin(locals?.user)) {
		return new Response(
			JSON.stringify({ status: 'Error', message: 'Only administrators can edit users.' }),
			{ status: 403 }
		);
	}

	const data = await request.json();
	const { _id, firstName, middleName, lastName, phone, province, country, email, license, role, newPassword } = data;

	if (!_id) {
		return new Response(JSON.stringify({ status: 'Error', message: 'User id is required.' }), { status: 400 });
	}

	const db = await clientPromise();
	const User = db.collection('users');

	const set: any = {
		'profile.firstName': firstName || '',
		'profile.middleName': middleName || '',
		'profile.lastName': lastName || '',
		'profile.displayName': `${firstName || ''} ${lastName || ''}`.trim(),
		'profile.phone': phone || '',
		'profile.province': province || '',
		'profile.country': country || '',
		'profile.email': email || '',
		license: license || '',
		role: role || ''
	};

	// Keep the primary login email in sync with the profile email.
	if (email) set['emails.0.address'] = email;

	// Optional admin password reset. The client sends SHA256(newPassword) to match
	// the app's bcrypt(SHA256(plaintext)) scheme; no current password is required
	// because an administrator is resetting another user's credentials.
	if (newPassword) set['services.password.bcrypt'] = await hashPassword(newPassword);

	const response = await User.updateOne({ _id }, { $set: set });

	return new Response(
		JSON.stringify({
			status: 'Success',
			message: 'User successfully updated',
			response
		})
	);
}
