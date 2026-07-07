import clientPromise from '$lib/server/mongo';
import { isAdmin } from '$lib/common/utils';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!isAdmin(locals?.user)) {
		return new Response(
			JSON.stringify({ status: 'Error', message: 'Only administrators can deactivate users.' }),
			{ status: 403 }
		);
	}

	const { _id, hard } = await request.json();

	if (!_id) {
		return new Response(JSON.stringify({ status: 'Error', message: 'User id is required.' }), { status: 400 });
	}

	// Guard against a user deleting/deactivating their own account.
	if (_id === locals.user._id) {
		return new Response(
			JSON.stringify({ status: 'Error', message: 'You cannot delete your own account.' }),
			{ status: 400 }
		);
	}

	const db = await clientPromise();
	const User = db.collection('users');

	// Hard delete permanently removes the account — irreversible, admin-only
	// (isAdmin is already enforced above); used to clean up duplicates.
	if (hard) {
		const response = await User.deleteOne({ _id });
		return new Response(
			JSON.stringify({ status: 'Success', message: 'User permanently deleted.', response })
		);
	}

	// Soft delete — deactivate rather than remove the record.
	const response = await User.updateOne({ _id }, { $set: { isActive: false } });

	return new Response(
		JSON.stringify({
			status: 'Success',
			message: 'User successfully deactivated',
			response
		})
	);
}
