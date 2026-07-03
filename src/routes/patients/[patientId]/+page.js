// Client-only: the patient + records are fetched and cached in the component so
// the chart works offline (server load can't run without a connection).
export const ssr = false;

export function load({ params }) {
	return { patientId: params.patientId };
}
