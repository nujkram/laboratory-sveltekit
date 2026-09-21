import type { Db } from 'mongodb';

/**
 * Laboratory transaction numbers come from an atomic counter
 * (`counters.labTransactionNo`), the same mechanism `caseNumber.ts` uses, so
 * two concurrent requests can never be handed the same reference — which would
 * be far worse here than for a case number, since the reference is what the
 * cashier charges against.
 *
 * The counter is seeded once from the highest existing transaction number. A
 * racing seed on two cold instances is resolved by the duplicate-key error on
 * the counter's fixed _id.
 *
 * NOTE: there is no `peek` twin of `nextTransactionNumber`. A transaction's
 * reference is printed on a receipt the customer carries to the cashier, so it
 * may only ever be a number this function actually allocated — never a
 * provisional one shown in a form before saving.
 */

const COUNTER_ID = 'labTransactionNo';

let seeded = false;

async function ensureCounter(db: Db) {
	if (seeded) return;
	const counters = db.collection('counters');
	const existing = await counters.findOne({ _id: COUNTER_ID as any });
	if (!existing) {
		const [row] = await db
			.collection('lab_transactions')
			.aggregate([
				{
					$group: {
						_id: null,
						max: {
							$max: { $convert: { input: '$transactionNo', to: 'int', onError: 0, onNull: 0 } }
						}
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

/**
 * Atomically allocate the next transaction number (increments the counter).
 *
 * The `.value` unwrap matches the installed mongodb driver (4.16), whose
 * findOneAndUpdate resolves to a ModifyResult. Driver v6 returns the document
 * itself — an upgrade must drop `.value` here and in `caseNumber.ts`, or both
 * counters silently start returning undefined.
 */
export async function nextTransactionNumber(db: Db): Promise<number> {
	await ensureCounter(db);
	const result = await db
		.collection('counters')
		.findOneAndUpdate({ _id: COUNTER_ID as any }, { $inc: { seq: 1 } }, { returnDocument: 'after' });
	return (result as any)?.value?.seq;
}
