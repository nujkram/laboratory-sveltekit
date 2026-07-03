// Client-only: the record + reference lists are fetched and cached in the
// component so editing works offline.
export const ssr = false;

export function load({ params }) {
	return { recordId: params.recordId };
}
