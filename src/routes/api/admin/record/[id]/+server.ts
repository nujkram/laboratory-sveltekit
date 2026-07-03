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
			{ $unwind: { path: '$medicalTechnologist', preserveNullAndEmptyArrays: true } },
			{ $unwind: { path: '$pathologist', preserveNullAndEmptyArrays: true } }
		])
		.toArray();

	return new Response(JSON.stringify({ status: 'Success', response: record || null }));
}
