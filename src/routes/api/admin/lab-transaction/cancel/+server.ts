import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { isAdmin } from '$lib/common/utils';
import { auditEntry } from '$lib/server/labTransaction';

/**
 * Cancel an unpaid laboratory transaction.
 *
 * Administrators only, and a PAID transaction can never be cancelled here —
 * reversing money is a refund, which is a different action with different
 * paperwork, not a quiet status flip. The guard is in the update filter rather
 * than a preceding read, so two concurrent attempts cannot both succeed.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}
	if (!isAdmin(locals.user)) {
		return json(
			{ status: 'Error', message: 'Only administrators can cancel a transaction.' },
			{ status: 403 }
		);
	}

	let raw;
	try {
		raw = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request body.' }, { status: 400 });
	}

	const _id = typeof raw?._id === 'string' ? raw._id : '';
	if (!_id) {
		return json({ status: 'Error', message: 'A transaction id is required.' }, { status: 400 });
	}
	const reason = String(raw?.reason ?? '').trim();
	if (!reason) {
		return json({ status: 'Error', message: 'A reason for cancelling is required.' }, { status: 400 });
	}

	const db = await clientPromise();
	const LabTransaction = db.collection('lab_transactions');

	const result = await LabTransaction.updateOne(
		{ _id, status: 'Pending', paymentStatus: 'Unpaid' },
		{
			$set: {
				status: 'Cancelled',
				cancelReason: reason,
				updated: new Date(),
				updateBy: locals.user._id
			},
			$push: { history: auditEntry('cancelled', locals.user, reason) as any }
		}
	);

	if (!result.matchedCount) {
		const current: any = await LabTransaction.findOne({ _id });
		if (!current) {
			return json({ status: 'Error', message: 'Transaction not found.' }, { status: 404 });
		}
		const why =
			current.paymentStatus === 'Paid'
				? 'That transaction has already been paid and cannot be cancelled. Process a refund instead.'
				: `That transaction is already ${String(current.status).toLowerCase()}.`;
		return json({ status: 'Conflict', message: why, response: current }, { status: 409 });
	}

	return json({ status: 'Success', message: 'Transaction cancelled' });
}
