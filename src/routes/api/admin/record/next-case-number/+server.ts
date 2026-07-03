import clientPromise from '$lib/server/mongo';

/**
 * Next case number = highest existing caseNumber + 1. Used to prefill the create
 * form and cached for offline (where it's shown as provisional; the authoritative
 * value is assigned at insert time).
 * @type {import('./$types').RequestHandler}
 */
export async function GET() {
	const db = await clientPromise();
	const [row] = await db
		.collection('records')
		.aggregate([
			{
				$group: {
					_id: null,
					max: { $max: { $convert: { input: '$caseNumber', to: 'int', onError: 0, onNull: 0 } } }
				}
			}
		])
		.toArray();
	const next = (row?.max || 0) + 1;
	return new Response(JSON.stringify({ status: 'Success', response: { next } }));
}
