// Replays queued writes to the server. Idempotent because each payload carries a
// client-generated _id and the insert endpoints upsert on it.
import { allPending, updateItem, removeItem, refreshPendingCount } from './outbox.js';
import { syncBlocked } from '$lib/stores/connectivity.js';

let flushing = false;

// Exponential backoff for transient (5xx / network) failures: 5s, 15s, 45s … capped.
function backoffMs(attempts) {
	return Math.min(5000 * Math.pow(3, Math.max(0, attempts - 1)), 5 * 60 * 1000);
}

export async function flushOutbox() {
	if (flushing) return;
	if (typeof navigator !== 'undefined' && !navigator.onLine) return;
	flushing = true;
	try {
		const items = await allPending();
		const now = Date.now();
		for (const item of items) {
			if (item.status === 'error' || item.status === 'conflict') continue; // needs manual resolution
			if (item.nextAttempt && item.nextAttempt > now) continue; // backing off
			await updateItem(item.queueId, { status: 'inflight' });
			try {
				const res = await fetch(item.endpoint, {
					method: item.method || 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					// "Keep mine" resolution sets item.force → overwrite the server version.
					body: JSON.stringify(item.force ? { ...item.body, force: true } : item.body)
				});

				if (res.status === 409) {
					const json = await res.json().catch(() => ({}));
					await updateItem(item.queueId, {
						status: 'conflict',
						lastError: json?.message || 'Changed on another device.'
					});
					continue;
				}

				if (res.status === 401) {
					// Session expired — nothing will upload until the user signs in again.
					syncBlocked.set(true);
					await updateItem(item.queueId, { status: 'pending' });
					break;
				}

				if (res.ok) {
					const json = await res.json().catch(() => ({}));
					if (json?.status === 'Success') {
						syncBlocked.set(false);
						await removeItem(item.queueId);
						continue;
					}
					// reachable but rejected (validation/permission) → needs attention
					await updateItem(item.queueId, {
						status: 'error',
						lastError: json?.message || 'Rejected by the server.',
						attempts: (item.attempts || 0) + 1
					});
					continue;
				}

				if (res.status >= 400 && res.status < 500) {
					const json = await res.json().catch(() => ({}));
					await updateItem(item.queueId, {
						status: 'error',
						lastError: json?.message || `Request failed (HTTP ${res.status}).`,
						attempts: (item.attempts || 0) + 1
					});
					continue;
				}

				// 5xx → transient; back off and stop this pass
				const attempts = (item.attempts || 0) + 1;
				await updateItem(item.queueId, { status: 'pending', attempts, nextAttempt: Date.now() + backoffMs(attempts) });
				break;
			} catch (e) {
				// network dropped mid-flush → back off, keep pending, stop
				const attempts = (item.attempts || 0) + 1;
				await updateItem(item.queueId, { status: 'pending', attempts, nextAttempt: Date.now() + backoffMs(attempts) });
				break;
			}
		}
	} finally {
		flushing = false;
		await refreshPendingCount();
	}
}

export function requestBackgroundSync() {
	try {
		if ('serviceWorker' in navigator && 'SyncManager' in window) {
			navigator.serviceWorker.ready.then((reg) => reg.sync.register('outbox')).catch(() => {});
		}
	} catch (e) {
		/* best effort */
	}
}

let started = false;
export function startAutoSync() {
	if (started || typeof window === 'undefined') return;
	started = true;
	window.addEventListener('online', flushOutbox);
	setInterval(() => {
		if (navigator.onLine) flushOutbox();
	}, 60000);
	// A service worker Background Sync fires a message we listen for too.
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.addEventListener('message', (event) => {
			if (event.data?.type === 'flush-outbox') flushOutbox();
		});
	}
	refreshPendingCount();
	flushOutbox();
}
