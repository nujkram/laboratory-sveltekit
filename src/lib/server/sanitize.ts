/**
 * Copy a client-supplied body, dropping anything dangerous to spread into a
 * Mongo update: keys that would be parsed as operators (`$…`) or as nested
 * paths (`a.b`), plus any server-managed fields the client must never set.
 * Returns a plain object; non-object input yields an empty object.
 */
export function cleanBody(data: any, protectedFields: string[] = []): Record<string, any> {
	const out: Record<string, any> = {};
	if (!data || typeof data !== 'object' || Array.isArray(data)) return out;
	for (const [key, value] of Object.entries(data)) {
		if (key.startsWith('$') || key.includes('.')) continue;
		if (protectedFields.includes(key)) continue;
		out[key] = value;
	}
	return out;
}
