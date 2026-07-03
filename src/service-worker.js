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

	// SvelteKit load data + reference GET APIs → stale-while-revalidate.
	if (url.pathname.endsWith('/__data.json') || SWR_API.some((p) => url.pathname.startsWith(p))) {
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
