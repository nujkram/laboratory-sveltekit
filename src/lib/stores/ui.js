import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Whether the navigation sidebar is expanded. Persisted so the choice sticks
// across reloads; defaults to open on desktop and collapsed on small screens.
const KEY = 'sidebarOpen';

function initial() {
	if (!browser) return true;
	const saved = localStorage.getItem(KEY);
	if (saved !== null) return saved === 'true';
	return window.innerWidth >= 640;
}

export const sidebarOpen = writable(initial());

if (browser) {
	sidebarOpen.subscribe((v) => {
		try {
			localStorage.setItem(KEY, String(v));
		} catch (e) {
			/* ignore storage failures (private mode, etc.) */
		}
	});
}

export function toggleSidebar() {
	sidebarOpen.update((v) => !v);
}

export function closeSidebar() {
	sidebarOpen.set(false);
}
