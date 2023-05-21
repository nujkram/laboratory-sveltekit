<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import dateToString from '$lib/utils/dateHelper';
	import { paginate, LightPaginationNav } from 'svelte-paginate';
	import AddUserForm from '$lib/components/forms/account/AddUserForm.svelte';


	let search;
	let items = [];
	let currentPage = 1;
	let pageSize = 6;
	let itemSize;
	let paginatedItems = [];
	let isModalOpen = false;

	$: {
		// reactive statement to automatically filter data
		paginatedItems = search
			? items.filter((student) => {
					return (
						student.firstName.match(RegExp(search, 'gi')) ||
						student.lastName.match(RegExp(search, 'gi'))
					);
			  })
			: items;
		if (paginatedItems.length) {
			itemSize = paginatedItems.length;
			paginatedItems = paginate({ items: paginatedItems, pageSize, currentPage });
		}
	}

	// For loading the modal
	async function loadUser() {
		try {
			let response = await fetch('/api/admin/user', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			let result = await response.json();
			items = result.response;
		} catch (error) {
			console.error('error', error);
		}
	}

</script>


<!-- commented out dashboard to temporarily disable and reduce clutter in this page -->
<!-- <Dashboard/> -->
<div class="p-4 sm:ml-64">
	<div class="container mt-12">
		
	</div>
</div>

{#if isModalOpen}
	<AddUserForm title={'Add User'} bind:isModalOpen {loadUser} />
{/if}
