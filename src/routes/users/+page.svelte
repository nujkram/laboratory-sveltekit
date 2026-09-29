<script>
	// @ts-nocheck
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { paginate } from 'svelte-paginate';
	import Button from "$lib/components/reusable/Button.svelte";
	import EditUserForm from "$lib/components/forms/user/EditUserForm.svelte";
	import DeleteUserForm from "$lib/components/forms/user/DeleteUserForm.svelte";
	import Sort from "$lib/components/reusable/Sort.svelte";
	import Edit from "$lib/components/icons/Edit.svelte";
	import Trash from "$lib/components/icons/Trash.svelte";
	import AddUserForm from '$lib/components/forms/user/AddUserForm.svelte';

    let status = 'all'
    let search;
    let items = [];
	let currentPage = 1;
	let pageSize = 10;
	let itemSize;
	let paginatedItems = [];
	let currentUser;
	let pageMinIndex = 1;
	let pageMaxIndex = pageSize;
	let sortOrder = 'asc';
	let sortBy = 'lastName';
    let isAddModalOpen = false;
    let isEditModalOpen = false;
	let isConfirmModalOpen = false;

	$: isAdmin = $page.data.user?.role === 'Administrator';

	// Modals
	const handleAddModal = () => (isAddModalOpen = !isAddModalOpen);
	// Act on the row whose button was clicked — never on whichever row the
	// pointer last passed over, which a keyboard or touch user never does.
	function editUser(user) {
		currentUser = user;
		isEditModalOpen = true;
	}
	function askDeactivate(user) {
		currentUser = user;
		isConfirmModalOpen = true;
	}

	// Plain substring match on any name part: no regex, so "(" cannot throw,
	// and a missing name part cannot either.
	function matchesSearch(user, term) {
		const q = (term ?? '').trim().toLowerCase();
		if (!q) return true;
		const p = user?.profile ?? {};
		return [p.firstName, p.middleName, p.lastName, p.email].some((v) =>
			String(v ?? '').toLowerCase().includes(q)
		);
	}

	async function loadUsers() {
		try {
			let response = await fetch('/api/admin/user', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			let result = await response.json();
			items = result.response;
			sortItems();
		} catch (error) {
			console.error('error', error);
		}
	}

	function sortItems() {
		let order = sortOrder === 'asc' ? 1 : -1;
		// names live under profile; isActive/created on the document itself
		const key = (u) => u?.profile?.[sortBy] ?? u?.[sortBy] ?? '';
		items = items.sort((a, b) => {
			if (key(a) < key(b)) return -1 * order;
			if (key(a) > key(b)) return 1 * order;
			return 0;
		});
	}

	function handleSort(columnName) {
		if (columnName === sortBy) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = columnName;
		}
		sortItems();
	}

	const decrementPageNumber = () => {
		if (currentPage > 1) currentPage -= 1;
	};
	const incrementPageNumber = () => {
		if (currentPage < totalPages) currentPage += 1;
	};

	onMount(async () => {
		loadUsers();
	});

	// Filter, count, clamp, then slice — in that order, so the footer's "x–y of n"
	// counts the filtered set and Next stops at the last page instead of paging
	// into an empty one that Prev cannot leave.
	$: if (pageSize < 1) pageSize = 1;
	$: filtered = items.filter(
		(p) => matchesSearch(p, search) && (status === 'all' || !!p.isActive === (status === 'active'))
	);
	$: itemSize = filtered.length;
	$: totalPages = Math.max(1, Math.ceil(itemSize / pageSize));
	$: if (currentPage > totalPages) currentPage = totalPages;
	$: paginatedItems = paginate({ items: filtered, pageSize, currentPage });
	$: pageMinIndex = itemSize === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	$: pageMaxIndex = Math.min(currentPage * pageSize, itemSize);
	// A new search or filter starts from the first page.
	$: search, status, (currentPage = 1);
</script>

<svelte:head><title>Users · Laboratory Information System</title></svelte:head>

<div class="animate-rise-in space-y-5">
	<!-- Page header -->
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-display text-2xl font-bold text-ink">Users</h2>
			<p class="mt-1 text-sm text-muted">
				Manage the staff who can sign in — technologists, pathologists, and administrators.
			</p>
		</div>
		{#if isAdmin}
			<Button color="primary" text="Add user" padding="py-2 px-4" on:click={handleAddModal}>
				<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
				</svg>
			</Button>
		{/if}
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
					<option value="all">All users</option>
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
						<th scope="col" class="px-5 py-3 font-semibold">Last name</th>
						<th scope="col" class="px-5 py-3 font-semibold">First name</th>
						<th scope="col" class="px-5 py-3 font-semibold">Middle name</th>
						<th scope="col" class="px-5 py-3 font-semibold">Email</th>
						<th scope="col" class="px-5 py-3 font-semibold">Role</th>
						<th scope="col" class="px-5 py-3 font-semibold">
							<span class="inline-flex items-center gap-1">Status <Sort on:click={() => handleSort('isActive')} /></span>
						</th>
						<th scope="col" class="px-5 py-3 text-right font-semibold">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-line">
					{#key paginatedItems}
						{#if paginatedItems.length}
							{#each paginatedItems as data (data._id)}
								<tr class="transition-colors hover:bg-paper">
									<td class="whitespace-nowrap px-5 py-3 font-medium text-ink">
										<!-- a real link, so the row opens from the keyboard too -->
										<a href="/users/{data._id}" class="text-ink no-underline hover:text-pine-700 hover:underline">
											{data?.profile?.lastName || '—'}
										</a>
									</td>
									<td class="whitespace-nowrap px-5 py-3 text-ink">{data?.profile?.firstName || '—'}</td>
									<td class="whitespace-nowrap px-5 py-3 text-muted">{data?.profile?.middleName || '—'}</td>
									<td class="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted">{data?.profile?.email || '—'}</td>
									<td class="whitespace-nowrap px-5 py-3">
										{#if data?.role}
											<span class="inline-flex items-center rounded-full bg-line/60 px-2.5 py-1 text-xs font-medium text-ink">{data.role}</span>
										{:else}
											<span class="text-xs text-muted">—</span>
										{/if}
									</td>
									<td class="px-5 py-3">
										<span
											class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {data.isActive
												? 'bg-leaf-soft text-pine-700'
												: 'bg-danger/10 text-danger'}"
										>
											<span class="h-1.5 w-1.5 rounded-full {data.isActive ? 'bg-leaf' : 'bg-danger'}" />
											{data.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td class="px-5 py-3">
										<div class="flex items-center justify-end gap-2">
											{#if isAdmin}
												<span title="Edit user">
													<Button color="warning" text="" padding="py-1.5 px-2.5" textSize="text-xs" on:click={() => editUser(data)}>
														<Edit /><span class="sr-only">Edit {data?.profile?.firstName} {data?.profile?.lastName}</span>
													</Button>
												</span>
												<span title="Deactivate user">
													<Button color="danger" text="" padding="py-1.5 px-2.5" textSize="text-xs" on:click={() => askDeactivate(data)}>
														<Trash /><span class="sr-only">Deactivate {data?.profile?.firstName} {data?.profile?.lastName}</span>
													</Button>
												</span>
											{:else}
												<span class="text-xs text-muted">—</span>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="6" class="px-5 py-14 text-center">
									<p class="font-display text-base font-semibold text-ink">No users found</p>
									<p class="mt-1 text-sm text-muted">
										{search || status !== 'all'
											? 'Try a different name or status filter.'
											: 'Add a staff member to get started.'}
									</p>
								</td>
							</tr>
						{/if}
					{/key}
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

{#if isAddModalOpen }
	<AddUserForm title='Add User' bind:isAddModalOpen {loadUsers} />
{/if}
{#if currentUser}
	{#if isEditModalOpen}
		<EditUserForm bind:isEditModalOpen {currentUser} {loadUsers} />
	{/if}
	{#if isConfirmModalOpen}
		<DeleteUserForm bind:isConfirmModalOpen {currentUser} {loadUsers} />
	{/if}
{/if}
