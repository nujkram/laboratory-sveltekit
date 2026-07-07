import { json } from '@sveltejs/kit';
import clientPromise from '$lib/server/mongo';
import { peekNextCaseNumber } from '$lib/server/caseNumber';

/**
 * Peek at the next case number (without allocating it). Used to prefill the
 * create form and cached for offline, where it's shown as provisional; the
 * authoritative value is assigned atomically at insert time.
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
	const next = await peekNextCaseNumber(db);
	return json({ status: 'Success', response: { next } });
}
