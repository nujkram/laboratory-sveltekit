<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { allPending, updateItem, removeItem } from '$lib/client/outbox.js';
	import { flushOutbox } from '$lib/client/sync.js';
	import { isOnline, pendingCount, syncBlocked } from '$lib/stores/connectivity.js';
	import { getRefData } from '$lib/client/refdata.js';

	let items = [];
	let loading = true;
	let syncing = false;
	let patientNames = {};

	async function refresh() {
		items = await allPending();
		// Build a patientId → name map from queued patients + the cached patient list.
		const map = {};
		for (const it of items) {
			if (it.entity === 'patient' && it.body?._id) {
				map[it.body._id] = `${it.body.firstName || ''} ${it.body.lastName || ''}`.trim();
			}
		}
		const cached = (await getRefData('patients')) ?? [];
		for (const p of cached) map[p._id] = p.completeName || `${p.firstName || ''} ${p.lastName || ''}`.trim();
		patientNames = map;
		loading = false;
	}

	async function syncNow() {
		syncing = true;
		await flushOutbox();
		await refresh();
		syncing = false;
	}

	async function retry(item) {
		await updateItem(item.queueId, { status: 'pending', lastError: null });
		await syncNow();
	}

	// Conflict resolution: overwrite the server version with the queued edit.
	async function keepMine(item) {
		await updateItem(item.queueId, { force: true, status: 'pending', lastError: null, nextAttempt: 0 });
		await syncNow();
	}

	async function discard(item) {
		if (confirm('Discard this unsynced entry? It will not be saved.')) {
			await removeItem(item.queueId);
			await refresh();
		}
	}

	function summarize(item) {
		const b = item.body || {};
		if (item.entity === 'patient' && item.endpoint.endsWith('/insert'))
			return { title: 'New patient', detail: `${b.firstName || ''} ${b.lastName || ''}`.trim() || '—' };
		if (item.entity === 'patient')
			return { title: 'Edit patient', detail: patientNames[b._id] || b._id };
		if (item.entity === 'record')
			return {
				title: 'New result',
				detail: `${b.category || 'Result'} · ${patientNames[b.patientId] || 'patient'}`
			};
		if (item.entity === 'settings') return { title: 'Settings update', detail: b.name || '' };
		return { title: item.entity, detail: '' };
	}

	onMount(refresh);
	// Re-read whenever the pending count changes (e.g. after a background sync).
	$: $pendingCount, refresh?.();
</script>

<div class="animate-rise-in mx-auto max-w-3xl space-y-5">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-display text-2xl font-bold text-ink">Pending sync</h2>
			<p class="mt-1 text-sm text-muted">
				Entries saved on this device that haven't uploaded yet. They sync automatically when you're
				back online.
			</p>
		</div>
		<button
			on:click={syncNow}
			disabled={!$isOnline || syncing || items.length === 0}
			class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if syncing}
				<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
				Syncing…
			{:else}
				Sync now
			{/if}
		</button>
	</div>

	{#if $syncBlocked}
		<div class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
			<span class="flex items-center gap-2">
				<span class="h-1.5 w-1.5 rounded-full bg-danger" />
				Your session expired — sign in again to upload these entries.
			</span>
			<a href="/auth/login" class="rounded-md bg-danger px-3 py-1 text-xs font-semibold text-white no-underline">Sign in</a>
		</div>
	{:else if !$isOnline}
		<div class="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm font-medium text-warning">
			<span class="h-1.5 w-1.5 rounded-full bg-warning" />
			You're offline — entries will upload when the connection returns.
		</div>
	{/if}

	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		{#if loading}
			<div class="flex items-center justify-center gap-3 px-5 py-14 text-muted">
				<svg class="h-5 w-5 animate-spin text-leaf" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
				<span class="text-sm font-medium">Loading…</span>
			</div>
		{:else if items.length === 0}
			<div class="px-5 py-14 text-center">
				<p class="font-display text-base font-semibold text-ink">All caught up</p>
				<p class="mt-1 text-sm text-muted">Nothing is waiting to sync.</p>
			</div>
		{:else}
			<ul class="divide-y divide-line">
				{#each items as item (item.queueId)}
					{@const s = summarize(item)}
					<li class="flex items-center justify-between gap-3 px-5 py-3.5">
						<div class="min-w-0">
							<p class="text-sm font-medium text-ink">{s.title}</p>
							<p class="truncate text-xs text-muted">{s.detail}</p>
						</div>
						<div class="flex items-center gap-3">
							{#if item.status === 'conflict'}
								<span class="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning" title={item.lastError || 'Changed on another device'}>
									<span class="h-1.5 w-1.5 rounded-full bg-warning" /> Conflict
								</span>
								<button on:click={() => keepMine(item)} class="text-xs font-medium text-leaf hover:underline" title="Overwrite the other version with yours">Keep mine</button>
								<button on:click={() => discard(item)} class="text-xs font-medium text-muted hover:text-danger">Discard</button>
							{:else if item.status === 'error'}
								<span class="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger" title={item.lastError || 'Failed'}>
									<span class="h-1.5 w-1.5 rounded-full bg-danger" /> Failed
								</span>
								<button on:click={() => retry(item)} class="text-xs font-medium text-leaf hover:underline">Retry</button>
								<button on:click={() => discard(item)} class="text-xs font-medium text-muted hover:text-danger">Discard</button>
							{:else if item.status === 'inflight'}
								<span class="inline-flex items-center gap-1.5 rounded-full bg-leaf-soft px-2.5 py-1 text-xs font-medium text-pine-700">Syncing…</span>
							{:else}
								<span class="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
									<span class="h-1.5 w-1.5 rounded-full bg-warning" /> Pending
								</span>
								<button on:click={() => discard(item)} class="text-xs font-medium text-muted hover:text-danger">Discard</button>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
