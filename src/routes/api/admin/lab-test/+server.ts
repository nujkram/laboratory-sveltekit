import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { LAB_TEST_SECTIONS } from '$lib/server/labTestCatalog';

/**
 * The laboratory test catalog, for the request builder's picker.
 *
 * Returns every test including unavailable ones — the picker shows them greyed
 * out so staff can see the code exists rather than assume it is missing — and
 * the section order from the paper form, so the picker groups the way the form
 * reads.
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ locals }: any) {
	if (!locals?.user) {
		return json(
			{ status: 'Error', code: 'AUTH', message: 'Your session has expired. Please sign in again.' },
			{ status: 401 }
		);
	}

	const db = await clientPromise();
	const response = await db
		.collection('lab_tests')
		.find({ isActive: { $ne: false } })
		.sort({ code: 1 })
		.toArray();

	return json({ status: 'Success', response, sections: LAB_TEST_SECTIONS, total: response.length });
}
