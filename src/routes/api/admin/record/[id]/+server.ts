import clientPromise from '$lib/server/mongo';

/**
 * Single record with med-tech / pathologist joined — client-fetchable so the
 * update form can load + cache it for offline editing.
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ params }: any) {
	const db = await clientPromise();
	const [record] = await db
		.collection('records')
		.aggregate([
			{ $match: { _id: params.id } },
			{ $lookup: { from: 'users', localField: 'medicalTechnologist', foreignField: '_id', as: 'medicalTechnologist' } },
			{ $lookup: { from: 'users', localField: 'pathologist', foreignField: '_id', as: 'pathologist' } },
			{ $lookup: {
				from: 'lab_transactions',
				localField: 'transactionId',
				foreignField: '_id',
				// only what the release gate needs — whether it was paid, not what it cost
				pipeline: [{ $project: { referenceNumber: 1, paymentStatus: 1, status: 1 } }],
				as: 'transaction'
			} },
			{ $unwind: { path: '$medicalTechnologist', preserveNullAndEmptyArrays: true } },
			{ $unwind: { path: '$pathologist', preserveNullAndEmptyArrays: true } },
			{ $unwind: { path: '$transaction', preserveNullAndEmptyArrays: true } }
		])
		.toArray();

	return new Response(JSON.stringify({ status: 'Success', response: record || null }));
}
