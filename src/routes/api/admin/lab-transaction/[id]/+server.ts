import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';

/**
 * One laboratory transaction by its document id, with the encoder's name
 * joined for the receipt footer and the audit trail.
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ params, locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}

	const db = await clientPromise();
	const [response] = await db
		.collection('lab_transactions')
		.aggregate([
			{ $match: { _id: params.id } },
			{ $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' } },
			{ $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
		])
		.toArray();

	if (!response) {
		return json({ status: 'Error', message: 'Transaction not found.' }, { status: 404 });
	}

	return json({ status: 'Success', response });
}
