import clientPromise from '$lib/server/mongo';
import { isAdmin } from '$lib/common/utils';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return new Response(JSON.stringify({ status: 'Error', message: 'Invalid access.' }), { status: 401 });
	}

	const { _id, hard } = await request.json();

	if (!_id) {
		return new Response(JSON.stringify({ status: 'Error', message: 'Patient id is required.' }), { status: 400 });
	}

	const db = await clientPromise();
	const Patient = db.collection('patients');

	// Hard delete permanently removes the document — irreversible, so it is
	// restricted to administrators (used to clean up duplicates in production).
	if (hard) {
		if (!isAdmin(locals.user)) {
			return new Response(
				JSON.stringify({ status: 'Error', message: 'Only administrators can permanently delete patients.' }),
				{ status: 403 }
			);
		}
		const response = await Patient.deleteOne({ _id });
		return new Response(
			JSON.stringify({ status: 'Success', message: 'Patient permanently deleted.', response })
		);
	}

	// Soft delete — deactivate rather than remove the record.
	const response = await Patient.updateOne({ _id }, { $set: { isActive: false } });

	return new Response(
		JSON.stringify({
			status: 'Success',
			message: 'Patient successfully deactivated',
			response
		})
	);
}
