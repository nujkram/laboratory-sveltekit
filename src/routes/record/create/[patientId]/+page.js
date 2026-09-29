// Client-only load: reference data (med-techs, pathologists, categories) and the
// case number are fetched + cached in the page so this works offline.
export const ssr = false;

export function load({ params, url }) {
	return {
		patientId: params.patientId,
		// Arriving from a charge slip's "Create result": preselect that slip.
		transactionId: url.searchParams.get('transaction') ?? ''
	};
}
