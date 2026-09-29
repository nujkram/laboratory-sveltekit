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
	import { canView } from '$lib/common/access';

	let cachedUser = null;

	// Set by the server guard when it bounced a page the user may not open. Read
	// once, then dropped from the address bar so a reload does not repeat it.
	let deniedNotice = false;
	$: if (browser && $page.url.searchParams.has('denied')) {
		deniedNotice = true;
		const clean = new URL(window.location.href);
		clean.searchParams.delete('denied');
		history.replaceState(history.state, '', clean);
	}

	// Whenever the app is used online, refresh the data needed offline: the form
	// reference lists, plus the working set (patients + recent records per patient)
	// so any active patient's chart opens offline — not just recently-viewed ones.
	//
	// All of it is clinical, so it is only warmed for roles that may read it. A
	// cashier caching 500 patient charts on the counter machine would undo the
	// access rules, and the API now refuses them anyway.
	function warmRefData() {
		if (typeof navigator === 'undefined' || !navigator.onLine) return;
		if (!canView($page.data.user, '/patients')) return;

		loadRefList('categories', '/api/admin/record/categories');
		loadRefList('medTechs', '/api/admin/user/med-tech');
		loadRefList('pathologists', '/api/admin/user/pathologist');
		prefetchWorkingSet();
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
				{#if deniedNotice}
					<div
						class="mb-4 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink"
						role="status"
						transition:fade={{ duration: 150 }}
					>
						<svg class="h-5 w-5 shrink-0 text-warning" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-11a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1zm0 7a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
						</svg>
						<span class="flex-1">
							That page isn't available to your role, so you were brought back here.
						</span>
						<button
							type="button"
							class="rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink"
							on:click={() => (deniedNotice = false)}
						>
							Dismiss
						</button>
					</div>
				{/if}
				<slot />
			</div>
		</main>
	{:else}
		<slot />
	{/if}
</div>
