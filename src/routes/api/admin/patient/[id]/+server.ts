import clientPromise from '$lib/server/mongo';

/**
 * Single patient (with createdBy joined) — client-fetchable so the patient chart
 * can load + cache it for offline.
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ params }: any) {
	const db = await clientPromise();
	const [patient] = await db
		.collection('patients')
		.aggregate([
			{ $match: { _id: params.id } },
			{ $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' } },
			{ $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
		])
		.toArray();

	return new Response(JSON.stringify({ status: 'Success', response: patient || null }));
}
