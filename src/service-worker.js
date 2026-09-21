/// <reference types="@sveltejs/kit" />
// Offline app shell. SvelteKit auto-registers this file in the built app.
import { build, files, version } from '$service-worker';

const CACHE = `lab-cache-${version}`;
const PRECACHE = [...build, ...files];

// GET reference reads that forms need offline (kept fresh, served from cache offline).
const SWR_API = [
	'/api/admin/record/categories',
	'/api/admin/user/med-tech',
	'/api/admin/user/pathologist',
	'/api/admin/record/next-case-number'
];

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

async function staleWhileRevalidate(request) {
	const cache = await caches.open(CACHE);
	const cached = await cache.match(request);
	const network = fetch(request)
		.then((res) => {
			if (res && res.ok) cache.put(request, res.clone());
			return res;
		})
		.catch(() => null);
	return cached || (await network) || Response.error();
}

/**
 * Always ask the network first; only fall back to the cache when it cannot be
 * reached. A cached response is still refreshed so the offline copy stays as
 * recent as the last successful load.
 */
async function networkFirstData(request) {
	const cache = await caches.open(CACHE);
	try {
		const res = await fetch(request);
		if (res && res.ok) cache.put(request, res.clone());
		return res;
	} catch {
		const cached = await cache.match(request);
		return cached || Response.error();
	}
}

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return; // writes go through the app's outbox

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	// Precached immutable build assets → cache-first.
	if (PRECACHE.includes(url.pathname)) {
		event.respondWith(caches.open(CACHE).then((c) => c.match(request).then((r) => r || fetch(request))));
		return;
	}

	// SvelteKit load data carries the SIGNED-IN USER, so it must never be served
	// stale: after a sign-out or a switch of staff on a shared terminal, a
	// cached copy would show the previous person's name and — now that the
	// sidebar is role-driven — their navigation. Network-first keeps the
	// identity honest online while still falling back to cache offline, which
	// is what the offline support actually needs.
	if (url.pathname.endsWith('/__data.json')) {
		event.respondWith(networkFirstData(request));
		return;
	}

	// Reference GET APIs (no per-user content) → stale-while-revalidate.
	if (SWR_API.some((p) => url.pathname.startsWith(p))) {
		event.respondWith(staleWhileRevalidate(request));
		return;
	}

	// Page navigations → network-first, fall back to cached page then the app shell.
	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request)
				.then((res) => {
					caches.open(CACHE).then((c) => c.put(request, res.clone()));
					return res;
				})
				.catch(async () => {
					const cache = await caches.open(CACHE);
					return (await cache.match(request)) || (await cache.match('/')) || Response.error();
				})
		);
		return;
	}
});

// Background Sync: nudge any open client to flush its outbox.
self.addEventListener('sync', (event) => {
	if (event.tag === 'outbox') {
		event.waitUntil(
			self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
				clients.forEach((c) => c.postMessage({ type: 'flush-outbox' }));
			})
		);
	}
});
