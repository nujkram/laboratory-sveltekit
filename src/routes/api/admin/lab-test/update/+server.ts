import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { isAdmin } from '$lib/common/utils';

/**
 * Edit a catalog test: its price, or whether it can be ordered.
 *
 * Administrators only — this is the number every future transaction charges.
 * Existing transactions are untouched by design: each one snapshotted the price
 * it was created with, so a correction here never rewrites an issued receipt.
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request, locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}
	if (!isAdmin(locals.user)) {
		return json(
			{ status: 'Error', message: 'Only administrators can change laboratory prices.' },
			{ status: 403 }
		);
	}

	let raw;
	try {
		raw = await request.json();
	} catch {
		return json({ status: 'Error', message: 'Invalid request body.' }, { status: 400 });
	}

	const code = Number(raw?.code);
	if (!Number.isInteger(code)) {
		return json({ status: 'Error', message: 'A valid test code is required.' }, { status: 400 });
	}

	const set: Record<string, any> = { updated: new Date(), updateBy: locals.user._id };

	if (raw?.priceCentavos !== undefined) {
		const priceCentavos = Number(raw.priceCentavos);
		if (!Number.isInteger(priceCentavos) || priceCentavos < 0) {
			return json(
				{ status: 'Error', message: 'Price must be a whole number of centavos, zero or more.' },
				{ status: 400 }
			);
		}
		set.priceCentavos = priceCentavos;
	}
	if (raw?.isAvailable !== undefined) set.isAvailable = !!raw.isAvailable;
	if (raw?.isActive !== undefined) set.isActive = !!raw.isActive;

	if (Object.keys(set).length === 2) {
		return json({ status: 'Error', message: 'Nothing to update.' }, { status: 400 });
	}

	const db = await clientPromise();
	const result = await db.collection('lab_tests').updateOne({ code }, { $set: set });

	if (!result.matchedCount) {
		return json({ status: 'Error', message: `Test ${code} was not found.` }, { status: 404 });
	}

	return json({ status: 'Success', message: 'Laboratory test updated', response: result });
}
