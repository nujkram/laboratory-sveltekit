import clientPromise from '$lib/server/mongo';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: any) {
    const data = await request.json();
    let { patientId, category, page = 1, pageSize = 10, sortBy = 'created', sortOrder = 'desc', search = '', status = 'all' } = data;

    // Clamp paging inputs so a caller can't request the whole collection.
    page = Math.max(1, parseInt(page, 10) || 1);
    pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));

    const db = await clientPromise();
    const Record = db.collection('records');

    // Filter on the record's own (indexed) fields first, before any joins.
    // Either scope by patient (patient chart) or by category (records browser).
    const match: any = {};
    if (patientId) match.patientId = patientId;
    if (category) match.category = category;
    if (status === 'active') match.isActive = true;
    else if (status === 'inactive') match.isActive = false;
    if (search) {
        // When the category is already fixed, searching category text is pointless
        // (it'd match everything) — search case number only in that case.
        match.$or = category
            ? [{ caseNumber: { $regex: search, $options: 'i' } }]
            : [
                { category: { $regex: search, $options: 'i' } },
                { caseNumber: { $regex: search, $options: 'i' } }
            ];
    }

    const sortableFields: any = { created: 'created', category: 'category', isActive: 'isActive', caseNumber: 'caseNumber' };
    const sortField = sortableFields[sortBy] || 'created';
    const direction = sortOrder === 'asc' ? 1 : -1;

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

    // $facet runs the page slice and the total count in one round-trip. The
    // expensive $lookup joins run only on the current page, not the whole history.
    const pipeline = [
        { $match: match },
        { $sort: { [sortField]: direction } },
        {
            $facet: {
                data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }, ...hydrate],
                totalCount: [{ $count: 'count' }]
            }
        }
    ];

    const [result] = await Record.aggregate(pipeline).toArray();
    const response = result?.data ?? [];
    const total = result?.totalCount?.[0]?.count ?? 0;

    return new Response(
        JSON.stringify({
            status: 'Success',
            response,
            total
        })
    )
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, locals }: any) {
    const db = await clientPromise();
    const Records = db.collection('records');

    const response = await Records.find({}).toArray();

    if (response) {
        return new Response(
            JSON.stringify({
                status: 'Success',
                response
            })
        )
    }
}