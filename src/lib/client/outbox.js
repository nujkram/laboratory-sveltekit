// The outbox: pending writes made while offline (or when a live POST failed).
// The `body` (which holds patient data) is stored encrypted; queue metadata
// (status, entity, endpoint, timestamps) stays clear so we can query/sort it.
import { getDB } from './db.js';
import { pendingCount } from '$lib/stores/connectivity.js';
import { encryptValue, decryptValue } from './crypto.js';

async function decodeRow(r) {
	if (!r) return r;
	const body = r.bodyEnc ? await decryptValue(r.bodyEnc) : r.body; // fallback for legacy rows
	const { bodyEnc, ...rest } = r;
	return { ...rest, body };
}

export async function enqueue(item) {
	const db = await getDB();
	if (!db) return;
	const { body, ...meta } = item;
	const bodyEnc = await encryptValue(body ?? null);
	await db.put('outbox', { status: 'pending', attempts: 0, createdAt: Date.now(), ...meta, bodyEnc });
	await refreshPendingCount();
}

export async function allPending() {
	const db = await getDB();
	if (!db) return [];
	const rows = await db.getAll('outbox');
	// FIFO so a create is replayed before any later edit of the same doc.
	const pending = rows.filter((r) => r.status !== 'done').sort((a, b) => a.createdAt - b.createdAt);
	return Promise.all(pending.map(decodeRow));
}

export async function updateItem(queueId, patch) {
	const db = await getDB();
	if (!db) return;
	const row = await db.get('outbox', queueId);
	if (!row) return;
	await db.put('outbox', { ...row, ...patch });
	await refreshPendingCount();
}

export async function removeItem(queueId) {
	const db = await getDB();
	if (!db) return;
	await db.delete('outbox', queueId);
	await refreshPendingCount();
}

export async function countPending() {
	const db = await getDB();
	if (!db) return 0;
	const rows = await db.getAll('outbox');
	return rows.filter((r) => r.status === 'pending' || r.status === 'error' || r.status === 'conflict').length;
}

export async function refreshPendingCount() {
	pendingCount.set(await countPending());
}
