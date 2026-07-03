<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { formatDateMDY } from '$lib/utils/dateHelper.js';
	import Button from '$lib/components/reusable/Button.svelte';
	import Sort from '$lib/components/reusable/Sort.svelte';
	import ChemistryModal from '$lib/components/modals/ChemistryModal.svelte';
	import MiscModal from '$lib/components/modals/MiscModal.svelte';
	import UrinalysisModal from '$lib/components/modals/UrinalysisModal.svelte';
	import ParasitologyModal from '$lib/components/modals/ParasitologyModal.svelte';
	import HematologyModal from '$lib/components/modals/HematologyModal.svelte';
	import { getRefData, cacheRefData } from '$lib/client/refdata.js';
	import { allPending } from '$lib/client/outbox.js';

	$: category = $page.params.category;

	let items = [];
	let itemSize = 0;
	let currentPage = 1;
	let pageSize = 10;
	let sortBy = 'created';
	let sortOrder = 'desc';
	let search = '';
	let status = 'all';
	let loading = true;
	let currentRecord;
	let isViewModalOpen = false;
	let searchTimer;

	const handleViewModal = () => (isViewModalOpen = !isViewModalOpen);

	async function loadRecords() {
		loading = true;
		const cacheKey = `catrecords:${category}`;
		try {
			if (navigator.onLine) {
				const response = await fetch('/api/admin/record', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ category, page: currentPage, pageSize, sortBy, sortOrder, search, status })
				});
				const result = await response.json();
				items = result.response ?? [];
				itemSize = result.total ?? 0;
				if (currentPage === 1 && !search && status === 'all') {
					cacheRefData(cacheKey, { items, total: itemSize });
				}
			} else {
				const cached = (await getRefData(cacheKey)) ?? { items: [], total: 0 };
				items = cached.items;
				itemSize = cached.total;
			}
		} catch (error) {
			const cached = (await getRefData(cacheKey)) ?? { items: [], total: 0 };
			items = cached.items;
			itemSize = cached.total;
		} finally {
			items = await mergePendingRecords(items);
			loading = false;
		}
	}

	// Results queued offline for this category, with patient name resolved from cache.
	async function mergePendingRecords(list) {
		const pending = (await allPending()).filter(
			(r) => r.entity === 'record' && r.endpoint.endsWith('/insert') && r.body?.category === category
		);
		if (!pending.length) return list;
		const cachedPatients = (await getRefData('patients')) ?? [];
		const nameById = {};
		for (const p of cachedPatients) nameById[p._id] = p.completeName || `${p.firstName || ''} ${p.lastName || ''}`.trim();
		for (const r of await allPending()) {
			if (r.entity === 'patient' && r.body?._id) nameById[r.body._id] = `${r.body.firstName || ''} ${r.body.lastName || ''}`.trim();
		}
		const ids = new Set(list.map((r) => r._id));
		const extra = pending
			.filter((r) => r.body?._id && !ids.has(r.body._id))
			.map((r) => ({
				...r.body,
				patient: { _id: r.body.patientId, completeName: nameById[r.body.patientId] || '' },
				isActive: true,
				_pending: true
			}));
		return [...extra, ...list];
	}

	function handleSort(column) {
		if (column === sortBy) sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		else {
			sortBy = column;
			sortOrder = 'asc';
		}
		currentPage = 1;
		loadRecords();
	}

	function handleSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			currentPage = 1;
			loadRecords();
		}, 300);
	}

	function handleStatus() {
		currentPage = 1;
		loadRecords();
	}

	const handleOverFlow = () => {
		if (pageSize < 1) pageSize = 1;
		currentPage = 1;
		loadRecords();
	};
	const decrementPageNumber = () => {
		if (currentPage > 1) {
			currentPage -= 1;
			loadRecords();
		}
	};
	const incrementPageNumber = () => {
		if (currentPage * pageSize < itemSize) {
			currentPage += 1;
			loadRecords();
		}
	};

	$: pageMinIndex = itemSize === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	$: pageMaxIndex = Math.min(currentPage * pageSize, itemSize);

	// Reload when the category param changes (navigating between category pages).
	let lastCategory;
	$: if (category && category !== lastCategory) {
		lastCategory = category;
		currentPage = 1;
		search = '';
		status = 'all';
		loadRecords();
	}

	onMount(loadRecords);
</script>

<div class="animate-rise-in space-y-6">
	<a
		href="/record"
		class="inline-flex items-center gap-1.5 text-sm font-medium text-muted no-underline transition-colors hover:text-pine-700"
	>
		<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path fill-rule="evenodd" d="M12.7 15.7a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 1.4L8.42 10l4.3 4.3a1 1 0 010 1.4z" clip-rule="evenodd" />
		</svg>
		All categories
	</a>

	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-display text-2xl font-bold text-ink">{category} records</h2>
			<p class="mt-1 text-sm text-muted">
				All <span class="font-mono">{itemSize}</span> {category} result{itemSize === 1 ? '' : 's'} on file, newest first.
			</p>
		</div>
	</div>

	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		<!-- Toolbar -->
		<div class="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
			<div>
				<label for="status" class="sr-only">Status</label>
				<select
					id="status"
					bind:value={status}
					on:change={handleStatus}
					class="rounded-lg border-line bg-surface py-2 pl-3 pr-9 text-sm font-medium text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				>
					<option value="all">All</option>
					<option value="active">Active</option>
					<option value="inactive">Inactive</option>
				</select>
			</div>
			<div class="relative min-w-[12rem] flex-1">
				<span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
						<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
					</svg>
				</span>
				<input
					type="search"
					bind:value={search}
					on:input={handleSearch}
					placeholder="Search by case number…"
					class="w-full rounded-lg border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				/>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-muted">
					<tr>
						<th scope="col" class="px-5 py-3 font-semibold">Patient</th>
						<th scope="col" class="px-5 py-3 font-semibold">Case no.</th>
						<th scope="col" class="px-5 py-3 font-semibold">
							<span class="inline-flex items-center gap-1">Created <Sort on:click={() => handleSort('created')} /></span>
						</th>
						<th scope="col" class="px-5 py-3 font-semibold">Medical tech.</th>
						<th scope="col" class="px-5 py-3 font-semibold">Pathologist</th>
						<th scope="col" class="px-5 py-3 font-semibold">Status</th>
						<th scope="col" class="px-5 py-3 text-right font-semibold">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-line">
					{#if loading}
						<tr>
							<td colspan="7" class="px-5 py-14 text-center">
								<div class="flex items-center justify-center gap-3 text-muted">
									<svg class="h-5 w-5 animate-spin text-leaf" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
										<path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
									</svg>
									<span class="text-sm font-medium">Loading records…</span>
								</div>
							</td>
						</tr>
					{:else if items.length}
						{#each items as data}
							<tr
								class="transition-colors hover:bg-paper"
								on:mouseenter={() => (currentRecord = data)}
							>
								<td class="whitespace-nowrap px-5 py-3">
									<a href="/patients/{data?.patient?._id}" class="font-medium text-ink no-underline hover:text-pine-700">
										{data?.patient?.completeName || '—'}
									</a>
								</td>
								<td class="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted">{data?.caseNumber || '—'}</td>
								<td class="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted">{formatDateMDY(data?.created) || '—'}</td>
								<td class="whitespace-nowrap px-5 py-3 text-ink">{data?.medicalTechnologist?.profile?.displayName || '—'}</td>
								<td class="whitespace-nowrap px-5 py-3 text-ink">{data?.pathologist?.profile?.displayName || '—'}</td>
								<td class="px-5 py-3">
									{#if data?._pending}
										<span class="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning" title="Saved on this device — will sync when back online">
											<span class="h-1.5 w-1.5 rounded-full bg-warning" /> Pending sync
										</span>
									{:else}
										<span
											class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {data?.isActive
												? 'bg-leaf-soft text-pine-700'
												: 'bg-danger/10 text-danger'}"
										>
											<span class="h-1.5 w-1.5 rounded-full {data?.isActive ? 'bg-leaf' : 'bg-danger'}" />
											{data?.isActive ? 'Active' : 'Inactive'}
										</span>
									{/if}
								</td>
								<td class="px-5 py-3">
									<div class="flex items-center justify-end gap-2">
										<Button color="primary" text="View" padding="py-1.5 px-3" textSize="text-xs" on:click={handleViewModal} />
										{#if !data?._pending}
											<Button color="warning" text="Update" type="link" href="/record/{data?._id}/update" padding="py-1.5 px-3" textSize="text-xs" />
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					{:else}
						<tr>
							<td colspan="7" class="px-5 py-14 text-center">
								<p class="font-display text-base font-semibold text-ink">
									{search ? 'No matching records' : `No ${category} records yet`}
								</p>
								<p class="mt-1 text-sm text-muted">
									{search ? 'Try a different case number.' : 'Results filed under this category will appear here.'}
								</p>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Footer / pagination -->
		<div class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
			<div class="flex items-center gap-4 text-sm text-muted">
				<label class="flex items-center gap-2">
					Rows
					<input
						type="number"
						min="1"
						bind:value={pageSize}
						on:change={handleOverFlow}
						class="w-16 rounded-lg border-line bg-surface py-1 text-center text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
					/>
				</label>
				<span>
					<span class="font-mono font-semibold text-ink">{pageMinIndex}</span>–<span
						class="font-mono font-semibold text-ink">{pageMaxIndex}</span
					>
					of <span class="font-mono font-semibold text-ink">{itemSize}</span>
				</span>
			</div>
			<div class="inline-flex gap-1">
				<button
					on:click={decrementPageNumber}
					class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:opacity-40"
					disabled={pageMinIndex <= 1}
				>
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
						<path fill-rule="evenodd" d="M12.7 15.7a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 1.4L8.42 10l4.3 4.3a1 1 0 010 1.4z" clip-rule="evenodd" />
					</svg>
					Prev
				</button>
				<button
					on:click={incrementPageNumber}
					class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:opacity-40"
					disabled={pageMaxIndex >= itemSize}
				>
					Next
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
						<path fill-rule="evenodd" d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4l4.3-4.3-4.3-4.3a1 1 0 010-1.4z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>

{#if isViewModalOpen && currentRecord}
	{#if currentRecord.category === 'Chemistry'}
		<ChemistryModal bind:isViewModalOpen data={currentRecord} />
	{:else if currentRecord.category === 'Urinalysis'}
		<UrinalysisModal bind:isViewModalOpen data={currentRecord} />
	{:else if currentRecord.category === 'Hematology'}
		<HematologyModal bind:isViewModalOpen data={currentRecord} />
	{:else if currentRecord.category === 'Parasitology'}
		<ParasitologyModal bind:isViewModalOpen data={currentRecord} />
	{:else if currentRecord.category === 'Miscellaneous'}
		<MiscModal bind:isViewModalOpen data={currentRecord} />
	{/if}
{/if}
