import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';

/**
 * The most recently recorded official receipt number, so the counter can
 * suggest the next one instead of having it typed from the booklet every time.
 *
 * "Most recent" is by the moment the payment was taken, not by the number
 * itself: the booklet is sequential, so the last receipt torn off is the one
 * to count on from. It is only a suggestion — the cashier can overwrite it.
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}

	const db = await clientPromise();
	const last: any = await db
		.collection('lab_transactions')
		.find({ 'payment.orNumber': { $exists: true, $ne: '' } }, { projection: { 'payment.orNumber': 1, 'payment.paidAt': 1 } })
		.sort({ 'payment.paidAt': -1 })
		.limit(1)
		.next();

	return json({ status: 'Success', response: { orNumber: last?.payment?.orNumber ?? null } });
}
