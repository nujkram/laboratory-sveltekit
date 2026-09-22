import type { Db } from 'mongodb';
import { id } from '$lib/common/utils';
import { CASHIER_ROLE, MANAGER_ROLE } from '$lib/common/utils';

/**
 * The `roles` collection is otherwise populated out of band, but a feature that
 * introduces a role is unusable until that role is in it — the user form only
 * offers roles that exist, so nobody could be given the one that unlocks the
 * feature.
 *
 * Idempotent: inserts only the roles that are absent, and never touches the
 * roles that are already there.
 */
const SEEDED_ROLES = [CASHIER_ROLE, MANAGER_ROLE];

export async function ensureRoles(db: Db) {
	const Role = db.collection('roles');
	const added: string[] = [];

	for (const name of SEEDED_ROLES) {
		const existing = await Role.findOne({ name });
		if (existing) continue;

		try {
			await Role.insertOne({ _id: id() as any, name });
			added.push(name);
		} catch (error: any) {
			// A concurrent instance inserted it first — that is the outcome we
			// wanted, so it is not an error.
			if (error?.code !== 11000) throw error;
		}
	}

	return added;
}
