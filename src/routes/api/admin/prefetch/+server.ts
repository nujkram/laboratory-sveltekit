import clientPromise from '$lib/server/mongo';

/**
 * Bulk "working set" for offline browsing, in one round-trip: active patients
 * (with createdBy) + recent records (hydrated) for the most recently-active
 * patients. Cached client-side so charts open offline even if never visited.
 * Bounded so it stays cheap as data grows.
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ locals }: any) {
	if (!locals?.user) {
		return new Response(JSON.stringify({ status: 'Error', code: 'AUTH', message: 'Session expired.' }), { status: 401 });
	}

	const PATIENT_LIMIT = 500; // patient list + headers
	const RECENT_PATIENTS = 60; // charts to prefetch records for
	const PER_PATIENT = 20; // records cached per patient

	const db = await clientPromise();
	const Patient = db.collection('patients');
	const Record = db.collection('records');

	const patients = await Patient.aggregate([
		{ $match: { isActive: true } },
		{ $sort: { created: -1 } },
		{ $limit: PATIENT_LIMIT },
		{ $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' } },
		{ $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
	]).toArray();

	// Patients with the most recent record activity → prefetch their charts.
	const recent = await Record.aggregate([
		{ $group: { _id: '$patientId', last: { $max: '$created' } } },
		{ $sort: { last: -1 } },
		{ $limit: RECENT_PATIENTS }
	]).toArray();
	const recentIds = recent.map((r: any) => r._id);

	const hydrate = [
		{ $lookup: { from: 'patients', localField: 'patientId', foreignField: '_id', as: 'patient' } },
		{ $lookup: { from: 'users', localField: 'medicalTechnologist', foreignField: '_id', as: 'medicalTechnologist' } },
		{ $lookup: { from: 'users', localField: 'pathologist', foreignField: '_id', as: 'pathologist' } },
		{ $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' } },
		{ $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
		{ $unwind: { path: '$medicalTechnologist', preserveNullAndEmptyArrays: true } },
		{ $unwind: { path: '$pathologist', preserveNullAndEmptyArrays: true } },
		{ $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
	];

	const [recentRecords, counts] = await Promise.all([
		recentIds.length
			? Record.aggregate([
				{ $match: { patientId: { $in: recentIds } } },
				{ $sort: { created: -1 } },
				{ $limit: RECENT_PATIENTS * PER_PATIENT },
				...hydrate
			]).toArray()
			: Promise.resolve([]),
		recentIds.length
			? Record.aggregate([
				{ $match: { patientId: { $in: recentIds } } },
				{ $group: { _id: '$patientId', total: { $sum: 1 } } }
			]).toArray()
			: Promise.resolve([])
	]);

	const totalById: any = Object.fromEntries(counts.map((c: any) => [c._id, c.total]));
	const records: any = {};
	for (const rec of recentRecords) {
		const pid = rec.patientId;
		if (!records[pid]) records[pid] = { items: [], total: totalById[pid] || 0 };
		if (records[pid].items.length < PER_PATIENT) records[pid].items.push(rec);
	}

	return new Response(JSON.stringify({ status: 'Success', response: { patients, records } }));
}
