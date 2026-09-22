import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { canViewReports } from '$lib/common/utils';

/**
 * Takings for a period: what was charged, what was discounted, what was
 * collected, and who collected it.
 *
 * READ ONLY. A manager reaches this and the transaction list and nothing that
 * writes, so the person reviewing the money is never the person moving it.
 *
 * Like the list endpoint, `dateFrom`/`dateTo` are full ISO instants computed by
 * the BROWSER: "today" has to mean today in Roxas City and the server runs in
 * UTC on Vercel. `timeZone` is passed for the same reason — the per-day buckets
 * below have to break where the working day breaks, not at 8am local.
 *
 * CANCELLED transactions are excluded from every money total. A cancelled
 * charge was never owed, so counting it as "charged" would overstate the day
 * and leave an outstanding balance nobody intends to collect. They are reported
 * separately as a count instead.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}
	// Defence in depth: access.ts already gates this path at the hook.
	if (!canViewReports(locals.user)) {
		return json(
			{ status: 'Error', message: 'Only a manager or administrator can view the reports.' },
			{ status: 403 }
		);
	}

	let data;
	try {
		data = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request body.' }, { status: 400 });
	}

	const { dateFrom = '', dateTo = '', timeZone = 'Asia/Manila' } = data ?? {};

	const from = dateFrom ? new Date(dateFrom) : null;
	const to = dateTo ? new Date(dateTo) : null;
	if ((from && isNaN(from.getTime())) || (to && isNaN(to.getTime()))) {
		return json({ status: 'Error', message: 'Invalid date range.' }, { status: 400 });
	}

	// An unknown zone makes $dateToString throw mid-pipeline, which would read as
	// a server fault rather than a bad parameter. Checked here instead.
	const zone = typeof timeZone === 'string' && timeZone ? timeZone : 'Asia/Manila';
	try {
		new Intl.DateTimeFormat('en-US', { timeZone: zone });
	} catch {
		return json({ status: 'Error', message: 'Unknown time zone.' }, { status: 400 });
	}

	const match: any = {};
	if (from || to) {
		match.created = {};
		if (from) match.created.$gte = from;
		if (to) match.created.$lte = to;
	}

	const db = await clientPromise();

	// `live` is everything the money totals are built from; `$match` on the whole
	// range first so the cancelled count still sees the same window.
	const paidNet = { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$netCentavos', 0] };
	const isStatutory = { $in: ['$discountType', ['Senior', 'PWD']] };

	const [result] = await db
		.collection('lab_transactions')
		.aggregate([
			{ $match: match },
			{
				$facet: {
					totals: [
						{ $match: { status: { $ne: 'Cancelled' } } },
						{
							$group: {
								_id: null,
								transactions: { $sum: 1 },
								grossCentavos: { $sum: '$grossCentavos' },
								discountCentavos: { $sum: '$discountCentavos' },
								statutoryDiscountCentavos: {
									$sum: { $cond: [isStatutory, '$discountCentavos', 0] }
								},
								netCentavos: { $sum: '$netCentavos' },
								collectedCentavos: { $sum: paidNet },
								paidCount: {
									$sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0] }
								}
							}
						}
					],
					cancelled: [
						{ $match: { status: 'Cancelled' } },
						{ $group: { _id: null, count: { $sum: 1 }, netCentavos: { $sum: '$netCentavos' } } }
					],
					byDay: [
						{ $match: { status: { $ne: 'Cancelled' } } },
						{
							$group: {
								_id: { $dateToString: { format: '%Y-%m-%d', date: '$created', timezone: zone } },
								transactions: { $sum: 1 },
								netCentavos: { $sum: '$netCentavos' },
								collectedCentavos: { $sum: paidNet },
								discountCentavos: { $sum: '$discountCentavos' }
							}
						},
						{ $sort: { _id: 1 } }
					],
					// Who took the money, from the snapshot on the payment rather than a
					// join: `paidByName` is what the receipt said, and a cashier who has
					// since been renamed or deactivated must still appear in an old
					// report under the name that was printed.
					byCashier: [
						{ $match: { paymentStatus: 'Paid', status: { $ne: 'Cancelled' } } },
						{
							$group: {
								_id: { $ifNull: ['$payment.paidBy', null] },
								name: { $last: '$payment.paidByName' },
								transactions: { $sum: 1 },
								collectedCentavos: { $sum: '$netCentavos' }
							}
						},
						{ $sort: { collectedCentavos: -1 } }
					],
					byDiscountType: [
						{ $match: { status: { $ne: 'Cancelled' }, discountCentavos: { $gt: 0 } } },
						{
							$group: {
								// Documents written before discount types existed carry an
								// amount and no type. They are reported as 'Other', never
								// reconstructed as statutory — see readDiscountType.
								_id: { $ifNull: ['$discountType', 'Other'] },
								transactions: { $sum: 1 },
								discountCentavos: { $sum: '$discountCentavos' }
							}
						},
						{ $sort: { discountCentavos: -1 } }
					]
				}
			}
		])
		.toArray();

	const t = result?.totals?.[0] ?? {};
	const grossCentavos = t.grossCentavos ?? 0;
	const discountCentavos = t.discountCentavos ?? 0;
	const statutoryDiscountCentavos = t.statutoryDiscountCentavos ?? 0;
	const netCentavos = t.netCentavos ?? 0;
	const collectedCentavos = t.collectedCentavos ?? 0;

	return json({
		status: 'Success',
		summary: {
			transactions: t.transactions ?? 0,
			paidCount: t.paidCount ?? 0,
			unpaidCount: (t.transactions ?? 0) - (t.paidCount ?? 0),
			grossCentavos,
			discountCentavos,
			statutoryDiscountCentavos,
			// Everything that is not a senior/PWD claim: ad-hoc concessions, plus
			// any legacy discount that predates the types.
			otherDiscountCentavos: discountCentavos - statutoryDiscountCentavos,
			netCentavos,
			collectedCentavos,
			outstandingCentavos: netCentavos - collectedCentavos,
			cancelledCount: result?.cancelled?.[0]?.count ?? 0
		},
		byDay: (result?.byDay ?? []).map((row: any) => ({
			day: row._id,
			transactions: row.transactions,
			netCentavos: row.netCentavos,
			collectedCentavos: row.collectedCentavos,
			discountCentavos: row.discountCentavos
		})),
		byCashier: (result?.byCashier ?? []).map((row: any) => ({
			id: row._id,
			name: row.name || 'Unnamed',
			transactions: row.transactions,
			collectedCentavos: row.collectedCentavos
		})),
		byDiscountType: (result?.byDiscountType ?? []).map((row: any) => ({
			type: row._id,
			transactions: row.transactions,
			discountCentavos: row.discountCentavos
		}))
	});
}
