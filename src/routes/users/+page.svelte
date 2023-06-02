<script>
	// @ts-nocheck
	import { goto } from '$app/navigation';
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
	let sortBy = 'code';
    let isAddModalOpen = false;
    let isEditModalOpen = false;
	let isConfirmModalOpen = false;
    
	// Modals
    const handleAddModal = () => (isAddModalOpen = !isAddModalOpen);
    const handleEditModal = () => (isEditModalOpen = !isEditModalOpen);
	const handleConfirmDeleteModal = () => (isConfirmModalOpen = !isConfirmModalOpen);

	function currentUserExist() {
		if (currentUser === undefined || !items.includes(currentUser)) {
			log.error('Selected user does not exist in items fetch from database!');
			return false;
		}

		return true;
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
		items = items.sort((a, b) => {
			if (a[sortBy] < b[sortBy]) return -1 * order;
			if (a[sortBy] > b[sortBy]) return 1 * order;
			return 0;
		});
	}

	function handleSort(columnName) {
		if (columnName === sortBy) {
			sortOrder = sortOrder === 'asc' ? 'des' : 'asc';
			console.warn(sortOrder);
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
		loadUsers();
	});

	$: {
		// Prevent user to input below the minimum or beyond the maximum value of pagesize.
		if (pageSize < 1) pageSize = 1;
		// reactive statement to automatically filter data based on status.
		paginatedItems = search
			? items.filter((user) => {
					return status !== 'all'
						? (user?.profile?.lastName.match(RegExp(search, 'gi')) ||
								user?.profile?.firstName.match(RegExp(search, 'gi'))) &&
								user.isActive === (status === 'active')
						: user?.profile?.lastName.match(RegExp(search, 'gi')) ||
								user?.profile?.firstName.match(RegExp(search, 'gi'));
			  })
			: items.filter((user) => {
					return status !== 'all' ? user?.isActive === (status === 'active') : items;
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

<div class="border-2 border-gray-100 rounded-lg h-auto dark:border-gray-700 mt-12">
	<div class="flex flex-col justify-center border-b h-fit rounded bg-blue-600 dark:bg-gray-800">
		<div class="flex flex-col px-5 justify-center py-4">
			<span class="text-xl font-semibold" style="color:white">Manage users</span>
		</div>
		<div class="flex gap-4 h-auto px-5 py-5 bg-white dark:bg-gray-800">
			<div class="flex flex-col w-full h-auto ">
				<label
					for="status"
					class="block mb-2 pl-1 text-m font-semibold text-gray-900 dark:text-white">Status</label
				>
				<div class="grid grid-cols-9">
					<select
						id="status"
						bind:value={status}
						class=" bg-gray-50 border border-gray-300 font-semibold text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						<option class="text-gray-900 text-sm font-semibold" value="all" selected>All</option>
						<option class="text-green-600 text-sm font-semibold" value="active"> Active</option>
						<option class="text-red-500 text-sm font-semibold" value="inactive">Inactive</option>
					</select>
					<div class="flex ml-2">
						<Button color='success' textSize='text-md' text='Create' on:click={handleAddModal} />
					</div>
					<div class="col-start-7 col-span-3 rounded ">
						<form class="flex items-center">
							<label for="search" class="sr-only">Search</label>
							<div class="relative w-full">
								<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<svg
										aria-hidden="true"
										class="w-5 h-5 text-gray-500 dark:text-gray-400"
										fill="currentColor"
										viewBox="0 0 20 20"
										><path
											fill-rule="evenodd"
											d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
											clip-rule="evenodd"
										/></svg
									>
								</div>
								<input
									type="search"
									bind:value={search}
									id="search"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									placeholder="Search"
									required
								/>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="flex items-center justify-center h-fit mb-1 rounded bg-gray-50 dark:bg-gray-800">
		<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto">
			<thead class="text-m  text-gray-700 border-b bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
				<tr>
					<th scope="col" class="pl-6">
                        Last Name
					</th>
					<th scope="col" class="pl-6">
                        First Name
					</th>
                    <th scope="col" class="pl-6">
                        Middle Name
					</th>
                    <th scope="col" class="pl-6">
                        Email
					</th>
					<th scope="col" class="pl-6">
                        Status 
                        <Sort on:click={() => handleSort('isActive')} />
                    </th>
					<th scope="col" class="pl-6">
						<div class="flex gap-2 w-max">
							<label for="items" class="block text-m font-semibold text-gray-900 dark:text-white"
								>No. of Entries</label
							>
							<input
								type="number"
								id="items"
								bind:value={pageSize}
								on:change={handleOverFlow}
								class="w-16 h-4 text-sm text-center text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600"
								placeholder=" "
							/>
						</div>
					</th>
				</tr>
			</thead>
			<tbody>
				{#key paginatedItems}
					{#if paginatedItems.length}
						{#each paginatedItems as data}
							<tr
								class=" bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
								on:mouseenter={() => {
									if (currentUser !== data) {
										currentUser = data;
									}
								}}
								on:click={() => {
									goto(`/users/${currentUser?._id}`);
								}}
							>
								<td
									class="px-6 py-4 text-gray-700 whitespace-nowrap dark:text-white text-m font-medium"
								>
									{data?.profile?.lastName || ''}
                                </td>
								<td class="px-6 py-4 text-gray-700 whitespace-nowrap dark:text-white text-m font-medium">
									{data?.profile?.firstName || ''}
								</td>
								<td class="px-6 py-4 text-gray-700 whitespace-nowrap dark:text-white text-m font-medium">
									{data?.profile?.middleName || ''}
								</td>
								<td class="px-6 py-4 text-gray-700 whitespace-nowrap dark:text-white text-m font-medium">
									{data?.profile?.email || ''}
								</td>
								<td class="flex items-center px-6 py-4">
									<div class="flex items-center ">
										<div
											class={data.isActive
												? 'h-2.5 w-2.5 rounded-full bg-green-500 mr-2'
												: 'h-2.5 w-2.5 rounded-full bg-red-500 mr-2'}
										/>
										<div class="text-sm text-gray-700 font-medium">
											{data.isActive ? 'Active' : 'Inactive'}
										</div>
									</div>
								</td>

								<td class="px-6 py-4 col-span-3">
									<Button
                                        color='warning' textSize='text-md' text='Update'
										on:click={handleEditModal}
									>
										<Edit />
									</Button>
									<Button
                                        color='danger' textSize='text-md' text='Delete'
										on:click={handleConfirmDeleteModal}
									>
										<Trash />
									</Button>
								</td>
							</tr>
						{/each}
					{/if}
				{/key}
			</tbody>
			<div class="flex flex-col items-center mt-2">
				<span class="text-sm text-gray-700 dark:text-gray-400">
					Showing <span class="font-semibold text-gray-900 dark:text-white">{pageMinIndex}</span> to
					<span class="font-semibold text-gray-900 dark:text-white">{pageMaxIndex}</span>
					of <span class="font-semibold text-gray-900 dark:text-white">{itemSize}</span> Entries
				</span>
				<div class="inline-flex mt-2 xs:mt-0">
					<button
						on:click={decrementPageNumber}
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
					>
						<svg aria-hidden="true" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
								clip-rule="evenodd"
							/>
						</svg>
						Prev
					</button>
					<button
						on:click={incrementPageNumber}
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
					>
						Next
						<svg aria-hidden="true" class="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		</table>
	</div>
</div>
{#if isAddModalOpen }
	<AddUserForm title='Add User' bind:isAddModalOpen {loadUsers} />
{/if}
{#if currentUserExist}
	{#if isEditModalOpen}
		<EditUserForm bind:isEditModalOpen {currentUser} {loadUsers} />
	{/if}
	{#if isConfirmModalOpen}
		<DeleteUserForm bind:isConfirmModalOpen {currentUser} {loadUsers} />
	{/if}
{/if}