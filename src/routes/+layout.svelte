<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	$: {
		if (!$page.data.user) {
			goto('/auth/login');
		}
	}
</script>

<div id="content" class="min-h-screen bg-paper text-ink">
	{#if $page.data.user}
		<Sidebar />
		<Navbar />
		<main class="pt-16 sm:pl-64">
			<div class="px-4 py-4 sm:px-5 lg:px-6">
				<slot />
			</div>
		</main>
	{:else}
		<slot />
	{/if}
</div>
