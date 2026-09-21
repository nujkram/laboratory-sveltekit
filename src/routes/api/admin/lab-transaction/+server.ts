import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { parseReference } from '$lib/common/labReference';

/**
 * The daily laboratory transactions list: paginated, filtered and searchable.
 *
 * Follows the `$facet` shape of `/api/admin/record` (page + total in one round
 * trip) and adds the filters the daily view needs.
 *
 * `dateFrom`/`dateTo` are full ISO instants computed by the BROWSER, not bare
 * calendar dates. "Today" has to mean today where the hospital is; the server
 * runs in UTC on Vercel, so deriving the day boundaries here would roll over at
 * 8am local time.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}

	let data;
	try {
		data = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request body.' }, { status: 400 });
	}

	let {
		page = 1,
		pageSize = 10,
		sortBy = 'created',
		sortOrder = 'desc',
		search = '',
		paymentStatus = 'all',
		status = 'all',
		createdBy = '',
		patientId = '',
		dateFrom = '',
		dateTo = ''
	} = data ?? {};

	page = Math.max(1, parseInt(page, 10) || 1);
	pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));

	const match: any = {};

	if (patientId) match.patientId = patientId;
	if (createdBy) match.createdBy = createdBy;
	if (paymentStatus && paymentStatus !== 'all') match.paymentStatus = paymentStatus;
	if (status && status !== 'all') match.status = status;

	const from = dateFrom ? new Date(dateFrom) : null;
	const to = dateTo ? new Date(dateTo) : null;
	if ((from && isNaN(from.getTime())) || (to && isNaN(to.getTime()))) {
		return json({ status: 'Error', message: 'Invalid date range.' }, { status: 400 });
	}
	if (from || to) {
		match.created = {};
		if (from) match.created.$gte = from;
		if (to) match.created.$lte = to;
	}

	const term = String(search ?? '').trim();
	if (term) {
		// A scanned or typed reference matches the number exactly; anything else
		// is treated as a name fragment.
		const asReference = parseReference(term);
		const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		match.$or = [
			{ 'customer.name': { $regex: escaped, $options: 'i' } },
			{ requestedBy: { $regex: escaped, $options: 'i' } },
			...(asReference === null ? [] : [{ transactionNo: asReference }])
		];
	}

	const sortableFields: any = {
		created: 'created',
		transactionNo: 'transactionNo',
		netCentavos: 'netCentavos',
		paymentStatus: 'paymentStatus'
	};
	const sortField = sortableFields[sortBy] ?? 'created';
	const direction = sortOrder === 'asc' ? 1 : -1;

	const hydrate = [
		{
			$lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' }
		},
		{ $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
	];

	const db = await clientPromise();
	const [result] = await db
		.collection('lab_transactions')
		.aggregate([
			{ $match: match },
			{ $sort: { [sortField]: direction } },
			{
				$facet: {
					data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }, ...hydrate],
					totalCount: [{ $count: 'count' }],
					// the daily view's footer: what was charged and what is still owed
					summary: [
						{
							$group: {
								_id: null,
								netCentavos: { $sum: '$netCentavos' },
								paidCentavos: {
									$sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$netCentavos', 0] }
								}
							}
						}
					]
				}
			}
		])
		.toArray();

	const response = result?.data ?? [];
	const total = result?.totalCount?.[0]?.count ?? 0;
	const summary = result?.summary?.[0] ?? { netCentavos: 0, paidCentavos: 0 };

	return json({
		status: 'Success',
		response,
		total,
		summary: {
			netCentavos: summary.netCentavos ?? 0,
			paidCentavos: summary.paidCentavos ?? 0,
			unpaidCentavos: (summary.netCentavos ?? 0) - (summary.paidCentavos ?? 0)
		}
	});
}
