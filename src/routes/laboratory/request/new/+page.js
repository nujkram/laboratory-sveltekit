// Client-rendered: the catalog and patient list are fetched in onMount.
export const ssr = false;

/** Arriving from a patient's chart or the list: preselect that patient. */
export function load({ url }) {
	return { patientId: url.searchParams.get('patientId') ?? '' };
}
