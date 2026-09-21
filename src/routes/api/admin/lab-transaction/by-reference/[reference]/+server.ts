import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { parseReference } from '$lib/common/labReference';

/**
 * Retrieve a transaction by the reference the customer presents — this is the
 * cashier's entry point.
 *
 * The reference is normalised, so a barcode scan ("LT-000123"), a QR scan and a
 * hand-typed "123" all resolve to the same transaction. Scanners are keyboard
 * wedges: they simply type the string, so nothing special is needed here.
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ params, locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}

	const transactionNo = parseReference(params.reference);
	if (transactionNo === null) {
		return json(
			{ status: 'Error', message: `"${params.reference}" is not a valid reference number.` },
			{ status: 400 }
		);
	}

	const db = await clientPromise();
	const [response] = await db
		.collection('lab_transactions')
		.aggregate([
			{ $match: { transactionNo } },
			{ $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' } },
			{ $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
		])
		.toArray();

	if (!response) {
		return json(
			{ status: 'Error', message: `No transaction found for reference ${params.reference}.` },
			{ status: 404 }
		);
	}

	return json({ status: 'Success', response });
}
