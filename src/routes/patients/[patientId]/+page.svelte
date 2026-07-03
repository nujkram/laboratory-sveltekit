<script>
	// @ts-nocheck
    import { calculateAge } from '$lib/utils/ageHelper';
    import {formatDateMDY} from '$lib/utils/dateHelper.js';
	import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
	import Button from "$lib/components/reusable/Button.svelte";
	import EditPatientForm from "$lib/components/forms/patient/EditPatientForm.svelte";
	import Sort from "$lib/components/reusable/Sort.svelte";
	import Edit from "$lib/components/icons/Edit.svelte";
	import ChemistryModal from '$lib/components/modals/ChemistryModal.svelte';
	import MiscModal from '$lib/components/modals/MiscModal.svelte';
	import UrinalysisModal from '$lib/components/modals/UrinalysisModal.svelte';
	import ParasitologyModal from '$lib/components/modals/ParasitologyModal.svelte';
	import HematologyModal from '$lib/components/modals/HematologyModal.svelte';


	export let data;

	let status = 'all';
	let search = '';
	let items = [];
	let currentPage = 1;
	let pageSize = 10;
	let itemSize = 0;
	let currentRecord;
	let sortOrder = 'desc';
	let sortBy = 'created';
	let isViewModalOpen = false;
	let loading = true;
	let searchTimer;

	let { patient } = data;
	let age = calculateAge(patient?.birthDate);

	// Modals
	const handleViewModal = () => (isViewModalOpen = !isViewModalOpen);

	// Records are paged, filtered and sorted in the database — the browser only
	// ever holds the current page, so this stays fast as a patient's history grows.
	async function loadRecord() {
		loading = true;
		try {
			let response = await fetch('/api/admin/record', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					patientId: patient._id,
					page: currentPage,
					pageSize,
					sortBy,
					sortOrder,
					search,
					status
				})
			});
			let result = await response.json();
			items = result.response ?? [];
			itemSize = result.total ?? 0;
		} catch (error) {
			console.error('error', error);
		} finally {
			loading = false;
		}
	}

	function handleSort(columnName) {
		if (columnName === sortBy) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = columnName;
			sortOrder = 'asc';
		}
		currentPage = 1;
		loadRecord();
	}

	function handleFilterChange() {
		currentPage = 1;
		loadRecord();
	}

	function handleSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			currentPage = 1;
			loadRecord();
		}, 300);
	}

	const handleOverFlow = () => {
		if (pageSize < 1) pageSize = 1;
		currentPage = 1;
		loadRecord();
	};

	const decrementPageNumber = () => {
		if (currentPage > 1) {
			currentPage -= 1;
			loadRecord();
		}
	};
	const incrementPageNumber = () => {
		if (currentPage * pageSize < itemSize) {
			currentPage += 1;
			loadRecord();
		}
	};

	$: pageMinIndex = itemSize === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	$: pageMaxIndex = Math.min(currentPage * pageSize, itemSize);

	onMount(loadRecord);
</script>

<div class="animate-rise-in space-y-6">
	<a
		href="/patients"
		class="inline-flex items-center gap-1.5 text-sm font-medium text-muted no-underline transition-colors hover:text-pine-700"
	>
		<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path fill-rule="evenodd" d="M12.7 15.7a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 1.4L8.42 10l4.3 4.3a1 1 0 010 1.4z" clip-rule="evenodd" />
		</svg>
		All patients
	</a>

	<!-- Patient header -->
	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		<div class="flex flex-wrap items-center gap-5 bg-pine-fade px-6 py-6 text-white">
			<span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-leaf-active ring-2 ring-white/15">
				<svg class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path d="M10 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM3.5 16.5a6.5 6.5 0 0113 0 .5.5 0 01-.5.5H4a.5.5 0 01-.5-.5z" />
				</svg>
			</span>
			<div class="min-w-0">
				<h2 class="font-display text-2xl font-bold leading-tight">
					{patient?.completeName}
					<span class="font-mono text-lg font-medium text-leaf-active">· {age}</span>
				</h2>
				{#if patient?.address}
					<p class="mt-1 text-sm text-white/70">{patient.address}</p>
				{/if}
			</div>
		</div>
		<dl class="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
			<div class="px-6 py-3">
				<dt class="text-xs font-semibold uppercase tracking-wide text-muted">Created</dt>
				<dd class="mt-0.5 font-mono text-sm text-ink">{formatDateMDY(patient?.created) || '—'}</dd>
			</div>
			<div class="px-6 py-3">
				<dt class="text-xs font-semibold uppercase tracking-wide text-muted">Created by</dt>
				<dd class="mt-0.5 text-sm text-ink">{patient?.createdBy?.profile?.displayName || '—'}</dd>
			</div>
		</dl>
	</div>

	<!-- Records -->
	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		<div class="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
			<h3 class="mr-auto font-display text-base font-bold text-ink">Records</h3>
			<div class="relative min-w-[10rem] flex-1 sm:max-w-xs">
				<span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
						<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
					</svg>
				</span>
				<input
					type="search"
					bind:value={search}
					on:input={handleSearch}
					id="search"
					placeholder="Search category or case no.…"
					class="w-full rounded-lg border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				/>
			</div>
			<Button color="primary" text="New result" type="link" href="/record/create/{patient?._id}" padding="py-2 px-4">
				<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
				</svg>
			</Button>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-muted">
					<tr>
						<th scope="col" class="px-5 py-3 font-semibold">
							<span class="inline-flex items-center gap-1">Category <Sort on:click={() => handleSort('category')} /></span>
						</th>
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
							<td colspan="6" class="px-5 py-14 text-center">
								<div class="flex items-center justify-center gap-3 text-muted">
									<svg class="h-5 w-5 animate-spin text-leaf" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
										<path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
									</svg>
									<span class="text-sm font-medium">Loading records…</span>
								</div>
							</td>
						</tr>
					{:else}
						{#key items}
						{#if items.length}
							{#each items as data}
								<tr
									class="transition-colors hover:bg-paper"
									on:mouseenter={() => {
										if (currentRecord !== data) {
											currentRecord = data;
										}
									}}
								>
									<td class="whitespace-nowrap px-5 py-3">
										<span class="inline-flex items-center rounded-full bg-leaf-soft px-2.5 py-1 text-xs font-medium text-pine-700">
											{data?.category || '—'}
										</span>
									</td>
									<td class="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted">{formatDateMDY(data?.created) || '—'}</td>
									<td class="whitespace-nowrap px-5 py-3 text-ink">{data?.medicalTechnologist?.profile?.displayName || '—'}</td>
									<td class="whitespace-nowrap px-5 py-3 text-ink">{data?.pathologist?.profile?.displayName || '—'}</td>
									<td class="px-5 py-3">
										<span
											class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {data?.isActive
												? 'bg-leaf-soft text-pine-700'
												: 'bg-danger/10 text-danger'}"
										>
											<span class="h-1.5 w-1.5 rounded-full {data?.isActive ? 'bg-leaf' : 'bg-danger'}" />
											{data?.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td class="px-5 py-3">
										<div class="flex items-center justify-end gap-2">
											<Button color="primary" text="View" padding="py-1.5 px-3" textSize="text-xs" on:click={handleViewModal} />
											<Button color="warning" text="Update" type="link" href="/record/{data?._id}/update" padding="py-1.5 px-3" textSize="text-xs" />
										</div>
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="6" class="px-5 py-14 text-center">
									<p class="font-display text-base font-semibold text-ink">
										{search ? 'No matching records' : 'No records yet'}
									</p>
									<p class="mt-1 text-sm text-muted">
										{search ? 'Try a different category or case number.' : "Add this patient's first laboratory result."}
									</p>
								</td>
							</tr>
						{/if}
					{/key}
					{/if}
				</tbody>
			</table>
		</div>

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
					of <span class="font-mono font-semibold text-ink">{itemSize || 0}</span>
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
					disabled={pageMaxIndex >= (itemSize || 0)}
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

{#if isViewModalOpen}
	{#if currentRecord.category === 'Chemistry'}
		<ChemistryModal bind:isViewModalOpen data={currentRecord} />
	{/if}
	{#if currentRecord.category === 'Urinalysis'}
		<UrinalysisModal bind:isViewModalOpen data={currentRecord}  />
	{/if}
	{#if currentRecord.category === 'Hematology'}
		<HematologyModal bind:isViewModalOpen data={currentRecord}  />
	{/if}
	{#if currentRecord.category === 'Parasitology'}
		<ParasitologyModal bind:isViewModalOpen data={currentRecord}  />
	{/if}
	{#if currentRecord.category === 'Miscellaneous'}
		<MiscModal bind:isViewModalOpen data={currentRecord} />
	{/if}
{/if}
