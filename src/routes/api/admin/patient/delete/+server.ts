import { json } from '@sveltejs/kit';
import clientPromise, { getClient } from '$lib/server/mongo';
import { isAdmin } from '$lib/common/utils';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return json({ status: 'Error', message: 'Invalid access.' }, { status: 401 });
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request body.' }, { status: 400 });
	}
	const { _id, hard } = body ?? {};

	if (typeof _id !== 'string' || !_id) {
		return json({ status: 'Error', message: 'Patient id is required.' }, { status: 400 });
	}

	const db = await clientPromise();
	const Patient = db.collection('patients');

	// Hard delete permanently removes the document — irreversible, so it is
	// restricted to administrators (used to clean up duplicates in production).
	if (hard) {
		if (!isAdmin(locals.user)) {
			return json(
				{ status: 'Error', message: 'Only administrators can permanently delete patients.' },
				{ status: 403 }
			);
		}

		const existing = await Patient.findOne({ _id }, { projection: { _id: 1 } });
		if (!existing) {
			return json({ status: 'Error', message: 'Patient not found.' }, { status: 404 });
		}

		// Cascade: remove the patient's lab records too, so none are orphaned.
		// Inside a transaction where the deployment supports one (replica set /
		// Atlas), so the patient and their records go together or not at all;
		// on a standalone server, fall back to sequential deletes — patient
		// first, so a partial failure can only leave unreachable records, never
		// a patient whose records have vanished.
		let recordCount = 0;
		const client = await getClient();
		const session = client.startSession();
		try {
			await session.withTransaction(async () => {
				const recordsResult = await db
					.collection('records')
					.deleteMany({ patientId: _id }, { session });
				await Patient.deleteOne({ _id }, { session });
				recordCount = recordsResult?.deletedCount ?? 0;
			});
		} catch (error: any) {
			// Transactions need a replica set; standalone servers throw. Fall back.
			if (/transaction|replica/i.test(error?.message ?? '')) {
				await Patient.deleteOne({ _id });
				const recordsResult = await db.collection('records').deleteMany({ patientId: _id });
				recordCount = recordsResult?.deletedCount ?? 0;
			} else {
				throw error;
			}
		} finally {
			await session.endSession();
		}

		return json({
			status: 'Success',
			message:
				recordCount > 0
					? `Patient and ${recordCount} record${recordCount === 1 ? '' : 's'} permanently deleted.`
					: 'Patient permanently deleted.',
			recordsDeleted: recordCount
		});
	}

	// Soft delete — deactivate rather than remove the record.
	const response = await Patient.updateOne({ _id }, { $set: { isActive: false } });

	if (response.matchedCount === 0) {
		return json({ status: 'Error', message: 'Patient not found.' }, { status: 404 });
	}

	return json({ status: 'Success', message: 'Patient successfully deactivated', response });
}
