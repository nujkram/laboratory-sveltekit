import clientPromise from '$lib/server/mongo';
import { isAdmin } from '$lib/common/utils';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	// Hard delete is irreversible, so it is restricted to administrators.
	if (!isAdmin(locals?.user)) {
		return new Response(
			JSON.stringify({ status: 'Error', message: 'Only administrators can delete records.' }),
			{ status: 403 }
		);
	}

	const { _id } = await request.json();

	if (!_id) {
		return new Response(JSON.stringify({ status: 'Error', message: 'Record id is required.' }), {
			status: 400
		});
	}

	const db = await clientPromise();
	const response = await db.collection('records').deleteOne({ _id });

	return new Response(
		JSON.stringify({
			status: 'Success',
			message: 'Record permanently deleted.',
			response
		})
	);
}
