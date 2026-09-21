import type { Db } from 'mongodb';

/**
 * Validate the optional link from a result record to the laboratory transaction
 * that paid for it.
 *
 * The link is what lets "what was charged" be reconciled against "what was
 * performed", and what the release gate reads to decide whether a result may be
 * printed. A link to another patient's charge would make both answers wrong, so
 * it is rejected rather than quietly stored.
 *
 * An absent link is always fine — every record predating this feature has none,
 * and one encoded offline cannot pick a transaction at all.
 */
export class RecordLinkError extends Error {}

/**
 * @param transactionId raw value from the request body
 * @param patientId the record's patient
 * @returns the id to store, or null when there is no link
 */
export async function validateTransactionLink(
	db: Db,
	transactionId: any,
	patientId: any
): Promise<string | null> {
	if (transactionId === undefined || transactionId === null || transactionId === '') return null;
	if (typeof transactionId !== 'string') {
		throw new RecordLinkError('That charge slip reference is not valid.');
	}

	const transaction: any = await db
		.collection('lab_transactions')
		.findOne({ _id: transactionId as any }, { projection: { patientId: 1, referenceNumber: 1 } });

	if (!transaction) {
		throw new RecordLinkError('That charge slip no longer exists.');
	}
	if (transaction.patientId && patientId && transaction.patientId !== patientId) {
		throw new RecordLinkError(
			`Charge slip ${transaction.referenceNumber} belongs to a different patient.`
		);
	}

	return transactionId;
}
