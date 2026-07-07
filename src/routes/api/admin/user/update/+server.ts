import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { hashPassword, isAdmin } from '$lib/common/utils';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!isAdmin(locals?.user)) {
		return json(
			{ status: 'Error', message: 'Only administrators can edit users.' },
			{ status: 403 }
		);
	}

	let data;
	try {
		data = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request body.' }, { status: 400 });
	}
	const { _id, firstName, middleName, lastName, phone, province, country, email, license, title, role, newPassword } =
		data ?? {};

	if (typeof _id !== 'string' || !_id) {
		return json({ status: 'Error', message: 'User id is required.' }, { status: 400 });
	}

	const db = await clientPromise();
	const User = db.collection('users');

	const existing = await User.findOne({ _id });
	if (!existing) {
		return json({ status: 'Error', message: 'User not found.' }, { status: 404 });
	}

	// The login email must stay unique — otherwise the login lookup picks an
	// arbitrary account among the duplicates.
	if (email) {
		const duplicate = await User.findOne({ 'emails.address': email, _id: { $ne: _id } });
		if (duplicate) {
			return json(
				{ status: 'Error', message: 'Another user already uses that email address.' },
				{ status: 409 }
			);
		}
	}

	// Partial update: only fields present in the request are written, so a
	// caller that omits a field doesn't blank it out.
	const set: any = {};
	const setIfProvided = (path: string, value: any) => {
		if (value !== undefined) set[path] = value;
	};
	setIfProvided('profile.firstName', firstName);
	setIfProvided('profile.middleName', middleName);
	setIfProvided('profile.lastName', lastName);
	setIfProvided('profile.title', title);
	setIfProvided('profile.phone', phone);
	setIfProvided('profile.province', province);
	setIfProvided('profile.country', country);
	setIfProvided('profile.email', email);
	setIfProvided('license', license);
	setIfProvided('role', role);

	// displayName derives from name + title; recompute from the merged values.
	// Credentials (MD, FPSP, RMT, DTA…) are appended so reports show them after the name.
	const mergedFirst = firstName ?? existing.profile?.firstName ?? '';
	const mergedLast = lastName ?? existing.profile?.lastName ?? '';
	const mergedTitle = title ?? existing.profile?.title ?? '';
	const fullName = `${mergedFirst} ${mergedLast}`.trim();
	set['profile.displayName'] = mergedTitle ? `${fullName}, ${mergedTitle}` : fullName;

	// Keep the primary login email in sync with the profile email. Replace the whole
	// `emails` array rather than `emails.0.address` — some records store it in a
	// non-standard shape (e.g. an array of plain strings), which the dotted path
	// can't write into (Mongo error 28: "Cannot create field 'address' …").
	if (email) set['emails'] = [{ address: email, verified: true }];

	// Optional admin password reset. The client sends SHA256(newPassword) to match
	// the app's bcrypt(SHA256(plaintext)) scheme; no current password is required
	// because an administrator is resetting another user's credentials.
	if (newPassword) set['services.password.bcrypt'] = await hashPassword(newPassword);

	const response = await User.updateOne({ _id }, { $set: set });

	return json({ status: 'Success', message: 'User successfully updated', response });
}
