<script>
	// @ts-nocheck
	// The price list. What a test costs is what every FUTURE transaction will
	// charge — transactions already raised snapshotted their prices, so nothing
	// edited here rewrites a receipt that has been issued.
	//
	// One row saves at a time, against /api/admin/lab-test/update, which takes a
	// single code. There is no bulk save: a half-applied bulk edit to a price
	// list is worse than four separate saves.
	import { onMount } from 'svelte';
	import Button from '$lib/components/reusable/Button.svelte';
	import { formatPeso, toCentavos } from '$lib/utils/currency';
	import { isOnline } from '$lib/stores/connectivity.js';

	let tests = [];
	let sections = [];
	let loading = true;
	let loadError = '';
	let search = '';

	/** code -> the typed peso string while a row is being edited */
	let drafts = {};
	let savingCode = null;
	let rowError = {};
	let savedCode = null;
	let savedTimer;

	// Each row carries its own draft and dirty flag as PLAIN VALUES. Svelte
	// tracks the identifiers in a markup expression, so `isDirty(test)` would
	// depend only on `isDirty` and `test` — never on `drafts` — and the Save
	// button would stay disabled no matter what was typed.
	$: rows = tests.map((test) => {
		const draft = drafts[test.code] ?? (test.priceCentavos / 100).toFixed(2);
		const draftCentavos = toCentavos(draft);
		return {
			...test,
			draft,
			draftCentavos,
			invalid: draftCentavos === null || draftCentavos < 0,
			dirty: draftCentavos !== null && draftCentavos !== test.priceCentavos
		};
	});

	$: visible = search.trim()
		? rows.filter((t) => {
				const term = search.trim().toLowerCase();
				return t.name.toLowerCase().includes(term) || String(t.code).includes(term);
		  })
		: rows;

	$: grouped = sections
		.map((section) => ({ section, rows: visible.filter((t) => t.section === section) }))
		.filter((group) => group.rows.length);

	async function load() {
		loading = true;
		loadError = '';
		try {
			const res = await fetch('/api/admin/lab-test', { credentials: 'include' });
			const result = await res.json();
			if (result?.status === 'Success') {
				tests = result.response ?? [];
				sections = result.sections ?? [];
				drafts = {};
			} else {
				loadError = result?.message || 'Could not load the price list.';
			}
		} catch {
			loadError = $isOnline
				? 'Could not load the price list.'
				: 'You are offline. The price list is only available online.';
		} finally {
			loading = false;
		}
	}

	async function save(test, changes) {
		if (savingCode) return;
		savingCode = test.code;
		rowError = { ...rowError, [test.code]: '' };

		try {
			const res = await fetch('/api/admin/lab-test/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ code: test.code, ...changes })
			});
			const result = await res.json();
			if (result?.status === 'Success') {
				// Patch the row in place rather than refetching the whole catalog: a
				// reload would scroll the manager away from the row they just edited.
				tests = tests.map((t) => (t.code === test.code ? { ...t, ...changes } : t));
				const { [test.code]: _dropped, ...rest } = drafts;
				drafts = rest;
				savedCode = test.code;
				clearTimeout(savedTimer);
				savedTimer = setTimeout(() => (savedCode = null), 2000);
			} else {
				rowError = { ...rowError, [test.code]: result?.message || 'Could not save.' };
			}
		} catch {
			rowError = { ...rowError, [test.code]: 'Could not reach the server. Nothing was saved.' };
		} finally {
			savingCode = null;
		}
	}

	function savePrice(row) {
		if (row.invalid) {
			rowError = { ...rowError, [row.code]: 'Enter a valid amount.' };
			return;
		}
		save(row, { priceCentavos: row.draftCentavos });
	}

	function toggleAvailable(test) {
		save(test, { isAvailable: test.isAvailable === false });
	}

	onMount(load);
</script>

<svelte:head><title>Price list · Laboratory Information System</title></svelte:head>

<div class="animate-rise-in space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-display text-2xl font-bold text-ink">Laboratory price list</h2>
			<p class="mt-1 text-sm text-muted">
				Applies to new transactions only. Charges already raised keep the price they were
				created with.
			</p>
		</div>
		<Button type="link" href="/reports" color="terciary" text="Back to reports" />
	</div>

	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		<div class="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
			<label for="search" class="sr-only">Search tests</label>
			<input
				id="search"
				type="text"
				bind:value={search}
				placeholder="Search by name or code"
				class="w-full max-w-xs rounded-lg border-line bg-surface py-2 px-3 text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
			/>
			{#if !$isOnline}
				<span class="text-sm font-medium text-warning">
					You are offline. Prices can only be changed online.
				</span>
			{/if}
		</div>

		{#if loading}
			<p class="px-5 py-10 text-center text-sm text-muted">Loading the price list…</p>
		{:else if loadError}
			<p class="px-5 py-10 text-center text-sm font-medium text-danger">{loadError}</p>
		{:else if !grouped.length}
			<p class="px-5 py-10 text-center text-sm text-muted">No tests match that search.</p>
		{:else}
			{#each grouped as group}
				<div class="border-b border-line last:border-0">
					<div class="bg-paper px-5 py-2">
						<h3 class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
							{group.section}
						</h3>
					</div>
					<table class="w-full text-sm">
						<tbody>
							{#each group.rows as test (test.code)}
								<tr class="border-b border-line/60 last:border-0">
									<td class="w-16 px-5 py-2 font-mono text-xs text-muted">{test.code}</td>
									<td class="px-2 py-2 text-ink">
										{test.name}
										{#if test.isAvailable === false}
											<span class="ml-2 rounded bg-paper px-1.5 py-0.5 text-xs text-muted">
												Not orderable
											</span>
										{/if}
										{#if rowError[test.code]}
											<p class="mt-0.5 text-xs font-medium text-danger">{rowError[test.code]}</p>
										{/if}
									</td>
									<td class="w-36 px-2 py-2 text-right text-xs text-muted">
										{#if test.dirty}
											<span class="tabular">was {formatPeso(test.priceCentavos)}</span>
										{:else if savedCode === test.code}
											<span class="font-medium text-pine-700">Saved</span>
										{/if}
									</td>
									<td class="w-32 px-2 py-2">
										<label class="sr-only" for={`price-${test.code}`}>
											Price for {test.name}
										</label>
										<input
											id={`price-${test.code}`}
											class="field tabular text-right"
											type="text"
											inputmode="decimal"
											value={test.draft}
											on:input={(e) => (drafts = { ...drafts, [test.code]: e.target.value })}
											disabled={!$isOnline || savingCode === test.code}
										/>
									</td>
									<td class="w-44 px-5 py-2">
										<div class="flex items-center justify-end gap-2">
											<Button
												color="secondary"
												text={savingCode === test.code ? 'Saving…' : 'Save'}
												disabled={!$isOnline || !test.dirty || savingCode === test.code}
												on:click={() => savePrice(test)}
											/>
											<button
												type="button"
												disabled={!$isOnline || savingCode === test.code}
												on:click={() => toggleAvailable(test)}
												class="text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
											>
												{test.isAvailable === false ? 'Make orderable' : 'Withdraw'}
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/each}
		{/if}
	</div>
</div>
