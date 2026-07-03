<script>
    // @ts-nocheck
	import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { paginate } from 'svelte-paginate';
	import Button from "$lib/components/reusable/Button.svelte";
	import EditPatientForm from "$lib/components/forms/patient/EditPatientForm.svelte";
	import DeletePatientForm from "$lib/components/forms/patient/DeletePatientForm.svelte";
	import Sort from "$lib/components/reusable/Sort.svelte";
	import Edit from "$lib/components/icons/Edit.svelte";
	import Trash from "$lib/components/icons/Trash.svelte";
	import { getRefData, cacheRefData } from '$lib/client/refdata.js';
	import { allPending } from '$lib/client/outbox.js';

    let status = 'all'
    let search;
    let items = [];
	let currentPage = 1;
	let pageSize = 10;
	let itemSize;
	let paginatedItems = [];
	let currentPatient;
	let pageMinIndex = 1;
	let pageMaxIndex = pageSize;
	let sortOrder = 'asc';
	let sortBy = 'code';
    let isEditModalOpen = false;
	let isConfirmModalOpen = false;
	let loading = true;

    // Modals
    const handleEditModal = () => (isEditModalOpen = !isEditModalOpen);
	const handleConfirmDeleteModal = () => (isConfirmModalOpen = !isConfirmModalOpen);

    function currentPatientExist() {
		if (currentPatient === undefined || !items.includes(currentPatient)) {
			log.error('Selected patient does not exist in items fetch from database!');
			return false;
		}

		if (patient.code === '' || patient.description === '') {
			return false;
		}
		return true;
	}

    async function loadPatient() {
		loading = true;
		try {
			if (navigator.onLine) {
				let response = await fetch('/api/admin/patient', {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' }
				});
				let result = await response.json();
				items = result.response ?? [];
				cacheRefData('patients', items); // keep a copy for offline
			} else {
				items = (await getRefData('patients')) ?? [];
			}
		} catch (error) {
			items = (await getRefData('patients')) ?? [];
		} finally {
			items = await mergePendingPatients(items);
			sortItems();
			loading = false;
		}
	}

	// Surface patients created offline (still in the outbox) so they can be
	// opened and used right away — before they've synced to the server.
	async function mergePendingPatients(list) {
		const pending = (await allPending()).filter(
			(r) => r.entity === 'patient' && r.endpoint.endsWith('/insert')
		);
		const ids = new Set(list.map((p) => p._id));
		const extra = pending
			.filter((r) => r.body?._id && !ids.has(r.body._id))
			.map((r) => ({
				...r.body,
				completeName: `${r.body.firstName || ''} ${r.body.lastName || ''}`.trim(),
				isActive: true,
				_pending: true
			}));
		return [...extra, ...list];
	}

	function sortItems() {
		let order = sortOrder === 'asc' ? 1 : -1;
		items = items.sort((a, b) => {
			if (a[sortBy] < b[sortBy]) return -1 * order;
			if (a[sortBy] > b[sortBy]) return 1 * order;
			return 0;
		});
	}

	function handleSort(columnName) {
		if (columnName === sortBy) {
			sortOrder = sortOrder === 'asc' ? 'des' : 'asc';
		} else {
			sortBy = columnName;
		}
		sortItems();
	}

    const handleOverFlow = () => {
		if (pageMinIndex > itemSize) currentPage = 1;
	};

    const decrementPageNumber = () => {
		if (currentPage > 1) currentPage -= 1;
	};
	const incrementPageNumber = () => {
		if (pageMaxIndex < itemSize) currentPage += 1;
	};

	onMount(async () => {
		loadPatient();
	});
    $: {
		// Prevent user to input below the minimum or beyond the maximum value of pagesize.
		if (pageSize < 1) pageSize = 1;
		// reactive statement to automatically filter data based on status.
		paginatedItems = search
			? items.filter((patient) => {
					return status !== 'all'
						? (patient.lastName.match(RegExp(search, 'gi')) ||
								patient.firstName.match(RegExp(search, 'gi'))) &&
								patient.isActive === (status === 'active')
						: patient.lastName.match(RegExp(search, 'gi')) ||
								patient.firstName.match(RegExp(search, 'gi'));
			  })
			: items.filter((patient) => {
					return status !== 'all' ? patient.isActive === (status === 'active') : items;
			  });
		if (paginatedItems.length) {
			itemSize = paginatedItems.length;
			paginatedItems = paginate({ items: paginatedItems, pageSize, currentPage });
		}
		pageMinIndex = paginatedItems.length == 0 ? 0 : 1 + (currentPage - 1) * pageSize;
		pageMaxIndex =
			pageSize * currentPage > paginatedItems.length
				? paginatedItems.length
				: pageSize * currentPage;
	}

</script>

<div class="animate-rise-in space-y-5">
	<!-- Page header -->
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-display text-2xl font-bold text-ink">Patients</h2>
			<p class="mt-1 text-sm text-muted">
				Search the registry, open a chart, or record a new result.
			</p>
		</div>
		<Button color="primary" type="link" href="/patients/create" text="New patient" padding="py-2 px-4">
			<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
			</svg>
		</Button>
	</div>

	<!-- Table card -->
	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		<!-- Toolbar -->
		<div class="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
			<div>
				<label for="status" class="sr-only">Status</label>
				<select
					id="status"
					bind:value={status}
					class="rounded-lg border-line bg-surface py-2 pl-3 pr-9 text-sm font-medium text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				>
					<option value="all">All patients</option>
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
					id="search"
					placeholder="Search by name…"
					class="w-full rounded-lg border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				/>
			</div>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-muted">
					<tr>
						<th scope="col" class="px-5 py-3 font-semibold">
							<span class="inline-flex items-center gap-1">Last name <Sort on:click={() => handleSort('lastName')} /></span>
						</th>
						<th scope="col" class="px-5 py-3 font-semibold">
							<span class="inline-flex items-center gap-1">First name <Sort on:click={() => handleSort('firstName')} /></span>
						</th>
						<th scope="col" class="px-5 py-3 font-semibold">
							<span class="inline-flex items-center gap-1">Middle name <Sort on:click={() => handleSort('middleName')} /></span>
						</th>
						<th scope="col" class="px-5 py-3 font-semibold">
							<span class="inline-flex items-center gap-1">Status <Sort on:click={() => handleSort('isActive')} /></span>
						</th>
						<th scope="col" class="px-5 py-3 text-right font-semibold">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-line">
					{#if loading}
						<tr>
							<td colspan="5" class="px-5 py-14 text-center">
								<div class="flex items-center justify-center gap-3 text-muted">
									<svg class="h-5 w-5 animate-spin text-leaf" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
										<path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
									</svg>
									<span class="text-sm font-medium">Loading patients…</span>
								</div>
							</td>
						</tr>
					{:else}
						{#key paginatedItems}
						{#if paginatedItems.length}
							{#each paginatedItems as data}
								<tr
									class="transition-colors hover:bg-paper"
									on:mouseenter={() => {
										if (currentPatient !== data) {
											currentPatient = data;
										}
									}}
								>
									<td class="whitespace-nowrap px-5 py-3 font-medium text-ink">{data.lastName || '—'}</td>
									<td class="whitespace-nowrap px-5 py-3 text-ink">{data.firstName || '—'}</td>
									<td class="whitespace-nowrap px-5 py-3 text-muted">{data.middleName || '—'}</td>
									<td class="px-5 py-3">
										{#if data._pending}
											<span class="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning" title="Saved on this device — will sync when back online">
												<span class="h-1.5 w-1.5 rounded-full bg-warning" />
												Pending sync
											</span>
										{:else}
											<span
												class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {data.isActive
													? 'bg-leaf-soft text-pine-700'
													: 'bg-danger/10 text-danger'}"
											>
												<span class="h-1.5 w-1.5 rounded-full {data.isActive ? 'bg-leaf' : 'bg-danger'}" />
												{data.isActive ? 'Active' : 'Inactive'}
											</span>
										{/if}
									</td>
									<td class="px-5 py-3">
										<div class="flex items-center justify-end gap-2">
											<Button color="terciary" text="Add result" type="link" href="/record/create/{data._id}" padding="py-1.5 px-3" textSize="text-xs" />
											{#if !data._pending}
												<Button color="primary" text="View" type="link" href="/patients/{data._id}" padding="py-1.5 px-3" textSize="text-xs" />
												<Button color="warning" text="" padding="py-1.5 px-2.5" textSize="text-xs" on:click={handleEditModal}>
													<Edit />
												</Button>
												<Button color="danger" text="" padding="py-1.5 px-2.5" textSize="text-xs" on:click={handleConfirmDeleteModal}>
													<Trash />
												</Button>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="5" class="px-5 py-14 text-center">
									<p class="font-display text-base font-semibold text-ink">No patients found</p>
									<p class="mt-1 text-sm text-muted">
										{search || status !== 'all'
											? 'Try a different name or status filter.'
											: 'Add your first patient to get started.'}
									</p>
								</td>
							</tr>
						{/if}
					{/key}
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

{#if currentPatientExist}
	{#if isEditModalOpen}
		<EditPatientForm bind:isEditModalOpen bind:currentPatient {loadPatient} />
	{/if}
	{#if isConfirmModalOpen}
		<DeletePatientForm bind:isConfirmModalOpen {currentPatient} {loadPatient} />
	{/if}
{/if}
