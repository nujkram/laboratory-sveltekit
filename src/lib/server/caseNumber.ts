import type { Db } from 'mongodb';

/**
 * Case numbers come from an atomic counter (`counters.caseNumber`) instead of
 * a max()+1 aggregation, so two concurrent inserts — e.g. an offline outbox
 * replaying several queued records at reconnect — can never be assigned the
 * same number.
 *
 * The counter is seeded once from the highest existing caseNumber. A racing
 * seed on two cold instances is resolved by the duplicate-key error on the
 * counter's fixed _id.
 */

const COUNTER_ID = 'caseNumber';

let seeded = false;

async function ensureCounter(db: Db) {
	if (seeded) return;
	const counters = db.collection('counters');
	const existing = await counters.findOne({ _id: COUNTER_ID as any });
	if (!existing) {
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
		try {
			await counters.insertOne({ _id: COUNTER_ID as any, seq: row?.max || 0 });
		} catch (error: any) {
			// 11000 = another instance seeded it first; that's fine.
			if (error?.code !== 11000) throw error;
		}
	}
	seeded = true;
}

/** Atomically allocate the next case number (increments the counter). */
export async function nextCaseNumber(db: Db): Promise<number> {
	await ensureCounter(db);
	const result = await db
		.collection('counters')
		.findOneAndUpdate(
			{ _id: COUNTER_ID as any },
			{ $inc: { seq: 1 } },
			{ returnDocument: 'after' }
		);
	return (result as any)?.value?.seq;
}

/** Read the next case number without allocating it (form prefill / offline cache). */
export async function peekNextCaseNumber(db: Db): Promise<number> {
	await ensureCounter(db);
	const doc = await db.collection('counters').findOne({ _id: COUNTER_ID as any });
	return ((doc as any)?.seq || 0) + 1;
}
