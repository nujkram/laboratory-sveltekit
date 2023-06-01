<script>
    // @ts-nocheck
    import { onMount } from 'svelte';

    let roles = [];
    let recordsCategories = [];
    let users = [];
    let records = [];
    let patients = [];

    $:{
        if(users.length > 0){
            for(let i = 0; i < roles.length; i++){
                roles[i].count = getTotal(users, 'role', roles[i].name);
            }
        }
        if(records.length > 0){
            for(let i = 0; i < recordsCategories.length; i++){
                recordsCategories[i].count = getTotal(records, 'category', recordsCategories[i].name);
            }
        }
    }

    async function fetchData(path) {
		try {
			let response = await fetch(path, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			let result = await response.json();
			return result.response;
		} catch (error) {
			console.error('error', error);
		}
	}

    function getTotal(array, property, sort)
    {
        if (!Array.isArray(array)|| array.length === 0)
            return 0;
        let count = 0;
        for(let i = 0; i < array.length; i++)
            if(array[i].hasOwnProperty(property) && array[i][property] === sort)
                count++;
        return count;
    }

    onMount(async () => {
        users = await fetchData('/api/admin/user');
        patients = await fetchData('/api/admin/patient');
        records = await fetchData('/api/admin/record');
        roles = await fetchData('/api/admin/role');
        recordsCategories = await fetchData('/api/admin/record/categories');
    });
</script>

<div class="p-4 border-2 border-gray-200 bg-gray-50 border rounded-lg dark:border-gray-700">
    <div class="flex items-center justify-center mb-4 rounded bg-gray-500 dark:bg-gray-800">
        <div class="block flex items-center py-8 flex-col border justify-center bg-white rounded dark:bg-gray-800 sm:px-16 xl:px-24">
            <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                Laboratory Dashboard
            </h1>
            <p class="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <div class="flex flex-row items-center justify-center gap-20 mt-8">
                <div class="flex flex-col items-center justify-center rounded dark:bg-gray-800">
                    <p class="mb-2 text-3xl font-extrabold">{users.length}</p>
                    <p class="text-gray-500 dark:text-gray-400">Total Users</p>
                </div>
                <div class="flex flex-col items-center justify-center rounded dark:bg-gray-800">
                    <p class="mb-2 text-3xl font-extrabold">{patients.length}</p>
                    <p class="text-gray-500 dark:text-gray-400">Total Patients</p>
                </div>
                <div class="flex flex-col items-center justify-center rounded dark:bg-gray-800">
                    <p class="mb-2 text-3xl font-extrabold">{records.length}</p>
                    <p class="text-gray-500 dark:text-gray-400">Total Records</p>
                </div>
            </div>  
        </div>
    </div>
    <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="flex flex-col rounded bg-gray-500 dark:bg-gray-800">
            <div class="w-full h-full bg-white border border-gray-200 rounded shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">Users - {users.length}</h5>
                    <a href="/users" class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                        View all users
                    </a>
                </div>
                <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                    {#key roles}
                        {#if roles.length}
                            {#each roles as role}
                                <li class="py-3 sm:py-4">
                                    <div class="flex items-center space-x-4">
                                        <div class="flex-1 min-w-0">
                                            <p class="text-l font-medium text-gray-900 truncate dark:text-white">
                                                {role.name}
                                            </p>
                                        </div>
                                        <div class="inline-flex items-center text-base font-bold text-gray-900 dark:text-white">
                                            {#if role.count}
                                                {role.count}
                                            {:else}
                                                0
                                            {/if}
                                        </div>
                                    </div>
                                </li>
                            {/each}
                        {/if}
                    {/key}
                </ul>
            </div>
        </div>
        <div class="flex items-center justify-center rounded bg-gray-500 dark:bg-gray-800">
            <div class="w-full h-full bg-white border border-gray-200 rounded shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">Patients - {patients.length}</h5>
                    <a href="/patients" class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                        View all patients
                    </a>
                </div>
            </div>
        </div>
        <div class="flex items-center justify-center rounded bg-gray-500 dark:bg-gray-800">
            <div class="w-full h-full bg-white border border-gray-200 rounded shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">Records - {records.length}</h5>
                    <a href="/" class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                        View all records
                    </a>
                </div>
                <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                    {#key recordsCategories}
                        {#if recordsCategories.length}
                            {#each recordsCategories as category}
                                <li class="py-3 sm:py-4">
                                    <div class="flex items-center space-x-4">
                                        <div class="flex-1 min-w-0">
                                            <p class="text-l font-medium text-gray-900 truncate dark:text-white">
                                                {category.name}
                                            </p>
                                        </div>
                                        <div class="inline-flex items-center text-base font-bold text-gray-900 dark:text-white">
                                            {#if category.count}
                                                {category.count}
                                            {:else}
                                                0
                                            {/if}
                                        </div>
                                    </div>
                                </li>
                            {/each}
                        {/if}
                    {/key}
                </ul>
            </div>
        </div>
    </div>
</div>