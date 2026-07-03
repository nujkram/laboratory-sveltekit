// Online/offline state + count of writes waiting to sync.
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const isOnline = writable(browser ? navigator.onLine : true);
export const pendingCount = writable(0);
// True when a queued write was rejected with 401 (session expired) — the user
// must sign in again before the queue can upload.
export const syncBlocked = writable(false);

if (browser) {
	window.addEventListener('online', () => isOnline.set(true));
	window.addEventListener('offline', () => isOnline.set(false));
}
