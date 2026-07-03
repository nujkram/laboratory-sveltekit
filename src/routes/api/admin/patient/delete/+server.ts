import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return new Response(JSON.stringify({ status: 'Error', message: 'Invalid access.' }), { status: 401 });
	}

	const { _id } = await request.json();

	if (!_id) {
		return new Response(JSON.stringify({ status: 'Error', message: 'Patient id is required.' }), { status: 400 });
	}

	const db = await clientPromise();
	const Patient = db.collection('patients');

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
