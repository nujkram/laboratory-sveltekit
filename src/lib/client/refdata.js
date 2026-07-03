// Cache of the reference lists the forms need (categories, med-techs, pathologists),
// plus the last-known signed-in user, so create/edit pages work offline.
import { getDB } from './db.js';
import { encryptValue, decryptValue } from './crypto.js';

export async function cacheRefData(key, data) {
	const db = await getDB();
	if (!db) return;
	const dataEnc = await encryptValue(data ?? null);
	await db.put('refdata', { key, dataEnc, cachedAt: Date.now() });
}

export async function getRefData(key) {
	const db = await getDB();
	if (!db) return null;
	const row = await db.get('refdata', key);
	if (!row) return null;
	return row.dataEnc ? await decryptValue(row.dataEnc) : (row.data ?? null); // legacy fallback
}

/**
 * Prefetch the offline "working set" in one call and cache it: the patients list,
 * each patient doc (for chart headers), and recent records per active patient (so
 * their charts open offline even if never visited this session). Best-effort.
 */
export async function prefetchWorkingSet() {
	if (typeof navigator !== 'undefined' && !navigator.onLine) return;
	try {
		const res = await fetch('/api/admin/prefetch', { credentials: 'include' });
		if (!res.ok) return;
		const { response } = await res.json();
		if (!response) return;
		const { patients = [], records = {} } = response;
		await cacheRefData('patients', patients);
		await Promise.all([
			...patients.map((p) => cacheRefData(`patient:${p._id}`, p)),
			...Object.entries(records).map(([pid, data]) => cacheRefData(`records:${pid}`, data))
		]);
	} catch (e) {
		/* best effort */
	}
}

/**
 * Return the reference list for `key`: fetch fresh when online (and re-cache),
 * otherwise fall back to the last cached copy. Endpoints return { response }.
 */
export async function loadRefList(key, url) {
	if (navigator.onLine) {
		try {
			const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
			const json = await res.json();
			const data = json.response ?? [];
			await cacheRefData(key, data);
			return data;
		} catch (e) {
			// fall through to cache
		}
	}
	return (await getRefData(key)) ?? [];
}
