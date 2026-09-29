<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import { landingFor } from '$lib/common/access';
	import Button from '$lib/components/reusable/Button.svelte';

	$: status = $page.status;
	$: home = landingFor($page.data?.user);
	$: heading =
		status === 404 ? 'Page not found' : status === 403 ? 'Not allowed' : 'Something went wrong';
</script>

<svelte:head><title>{heading} · Laboratory Information System</title></svelte:head>

<div class="mx-auto grid min-h-[60vh] max-w-lg place-content-center text-center">
	<p class="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-muted">Error {status}</p>
	<h1 class="mt-2 font-display text-2xl font-bold text-ink">{heading}</h1>
	{#if $page.error?.message && $page.error.message !== heading}
		<p class="mt-2 text-sm text-muted">{$page.error.message}</p>
	{/if}
	<div class="mt-6 flex justify-center gap-2">
		<Button type="link" href={home} color="primary" text="Back to my home page" />
	</div>
</div>
