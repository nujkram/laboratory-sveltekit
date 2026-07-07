<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { isOnline } from '$lib/stores/connectivity.js';
	import { sidebarOpen, closeSidebar } from '$lib/stores/ui.js';
	import { fade } from 'svelte/transition';
	import { cacheRefData, getRefData, loadRefList, prefetchWorkingSet } from '$lib/client/refdata.js';
	import { startAutoSync } from '$lib/client/sync.js';

	let cachedUser = null;

	// Whenever the app is used online, refresh the data needed offline: the form
	// reference lists, plus the working set (patients + recent records per patient)
	// so any active patient's chart opens offline — not just recently-viewed ones.
	function warmRefData() {
		if (typeof navigator !== 'undefined' && navigator.onLine) {
			loadRefList('categories', '/api/admin/record/categories');
			loadRefList('medTechs', '/api/admin/user/med-tech');
			loadRefList('pathologists', '/api/admin/user/pathologist');
			prefetchWorkingSet();
		}
	}

	// Offline, fall back to the last-known signed-in user so the app stays usable.
	$: user = $page.data.user || (!$isOnline ? cachedUser : null);

	// Keep the last-known user fresh whenever the server confirms one.
	$: if (browser && $page.data.user) cacheRefData('currentUser', $page.data.user);

	// Only bounce to login when we're ONLINE and genuinely unauthenticated —
	// offline we trust the cached session (the httpOnly cookie is still valid).
	$: if (browser && $isOnline && !$page.data.user) {
		cacheRefData('currentUser', null);
		goto('/auth/login');
	}

	onMount(async () => {
		cachedUser = await getRefData('currentUser');
		startAutoSync();
		warmRefData();
	});

	// Also re-warm whenever we come back online.
	$: if (browser && $isOnline) warmRefData();
</script>

<div id="content" class="min-h-screen bg-paper text-ink">
	{#if user}
		<Sidebar />
		<!-- Backdrop: only on small screens, where the open sidebar overlays content. -->
		{#if $sidebarOpen}
			<div
				class="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm sm:hidden"
				transition:fade={{ duration: 200 }}
				on:click={closeSidebar}
				aria-hidden="true"
			/>
		{/if}
		<Navbar {user} />
		<main class="pt-16 transition-[padding] duration-300 ease-in-out {$sidebarOpen ? 'sm:pl-64' : 'sm:pl-0'}">
			<div class="px-4 py-4 sm:px-5 lg:px-6">
				<slot />
			</div>
		</main>
	{:else}
		<slot />
	{/if}
</div>
