import type { Db } from 'mongodb';
import { id } from '$lib/common/utils';
import { CASHIER_ROLE } from '$lib/common/utils';

/**
 * The `roles` collection is otherwise populated out of band, but the cashier
 * feature is unusable until "Cashier" is in it — the user form only offers
 * roles that exist, so nobody could be given the one that unlocks taking
 * payment.
 *
 * Idempotent: inserts the role only when it is absent, and never touches the
 * roles that are already there.
 */
export async function ensureCashierRole(db: Db) {
	const Role = db.collection('roles');
	const existing = await Role.findOne({ name: CASHIER_ROLE });
	if (existing) return false;

	try {
		await Role.insertOne({ _id: id() as any, name: CASHIER_ROLE });
		return true;
	} catch (error: any) {
		// A concurrent instance inserted it first — that is the outcome we wanted.
		if (error?.code === 11000) return false;
		throw error;
	}
}
