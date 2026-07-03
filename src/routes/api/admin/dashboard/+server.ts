import clientPromise from '$lib/server/mongo';

/**
 * Dashboard summary: totals, KPIs, a monthly volume trend, and category / staff
 * breakdowns — all computed in the database (counts + $group aggregations), so it
 * stays fast as the records collection grows instead of downloading every row.
 * @type {import('./$types').RequestHandler}
 */
export async function GET() {
	const db = await clientPromise();

	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	// First day of the month, 7 months back → an 8-month window for the trend.
	const trendStart = new Date(now.getFullYear(), now.getMonth() - 7, 1);

	const [patients, records, users] = await Promise.all([
		db.collection('patients').estimatedDocumentCount(),
		db.collection('records').estimatedDocumentCount(),
		db.collection('users').estimatedDocumentCount()
	]);

	const [
		recordsThisMonth,
		recordsToday,
		patientsThisMonth,
		activePatients,
		categoryDefs,
		roleDefs,
		categoryCounts,
		roleCounts,
		monthlyRaw,
		topMedTechsRaw
	] = await Promise.all([
		db.collection('records').countDocuments({ created: { $gte: startOfMonth } }),
		db.collection('records').countDocuments({ created: { $gte: startOfToday } }),
		db.collection('patients').countDocuments({ created: { $gte: startOfMonth } }),
		db.collection('patients').countDocuments({ isActive: true }),
		db.collection('record_categories').find({}).project({ name: 1 }).sort({ name: 1 }).toArray(),
		db.collection('roles').find({}).project({ name: 1 }).sort({ name: 1 }).toArray(),
		db
			.collection('records')
			.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
			.toArray(),
		db
			.collection('users')
			.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
			.toArray(),
		// Monthly volume — tolerate created stored as Date or string via $convert.
		db
			.collection('records')
			.aggregate([
				{ $addFields: { _d: { $convert: { input: '$created', to: 'date', onError: null, onNull: null } } } },
				{ $match: { _d: { $gte: trendStart } } },
				{ $group: { _id: { y: { $year: '$_d' }, m: { $month: '$_d' } }, count: { $sum: 1 } } }
			])
			.toArray(),
		// Staff workload — records per medical technologist, top 6.
		db
			.collection('records')
			.aggregate([
				{ $match: { medicalTechnologist: { $nin: [null, ''] } } },
				{ $group: { _id: '$medicalTechnologist', count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
				{ $limit: 6 },
				{ $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
				{ $unwind: { path: '$u', preserveNullAndEmptyArrays: true } },
				{ $project: { _id: 0, name: { $ifNull: ['$u.profile.displayName', 'Unassigned'] }, count: 1 } }
			])
			.toArray()
	]);

	const categoryMap = Object.fromEntries(categoryCounts.map((c: any) => [c._id, c.count]));
	const roleMap = Object.fromEntries(roleCounts.map((r: any) => [r._id, r.count]));
	const categories = categoryDefs.map((c: any) => ({ name: c.name, count: categoryMap[c.name] || 0 }));
	const roles = roleDefs.map((r: any) => ({ name: r.name, count: roleMap[r.name] || 0 }));

	// Build a continuous 8-month axis (fill gaps with 0) from the grouped counts.
	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const monthlyMap = Object.fromEntries(monthlyRaw.map((m: any) => [`${m._id.y}-${m._id.m}`, m.count]));
	const monthly = [];
	for (let i = 7; i >= 0; i--) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		monthly.push({
			label: monthNames[d.getMonth()],
			ym: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
			count: monthlyMap[`${d.getFullYear()}-${d.getMonth() + 1}`] || 0
		});
	}

	return new Response(
		JSON.stringify({
			status: 'Success',
			response: {
				counts: { patients, records, users },
				kpis: { recordsThisMonth, recordsToday, patientsThisMonth, activePatients },
				categories,
				roles,
				monthly,
				topMedTechs: topMedTechsRaw
			}
		})
	);
}
