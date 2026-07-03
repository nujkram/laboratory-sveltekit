// Client-only load: reference data (med-techs, pathologists, categories) and the
// case number are fetched + cached in the page so this works offline.
export const ssr = false;

export function load({ params }) {
	return { patientId: params.patientId };
}
