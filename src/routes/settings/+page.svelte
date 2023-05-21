<script>
	// @ts-nocheck
	import { fade } from 'svelte/transition';
	export let data;
	const { settings } = data;

	let name = settings?.name;
	let location = settings?.location;
	let mobile = settings?.mobile;
    let message;
</script>
<div class="border-2 border-gray-100 rounded-lg h-auto dark:border-gray-700 mt-12">
	<div class="flex flex-col justify-center border-b h-fit rounded-t bg-blue-600 dark:bg-gray-800">
		<div class="flex flex-col px-5 justify-center py-4">
			<span class="text-xl font-semibold" style="color:white">Settings</span>
		</div>
	</div>
	<div class="flex items-center mt-4 h-fit mb-1 rounded bg-gray-50 dark:bg-gray-800">
		<form
			class="w-full max-w-sm mb-4"
			on:submit|preventDefault={async () => {
				try {
					let response = await fetch('/api/admin/settings/update', {
						method: 'POST',
						headers: {
							'content-type': 'application/json'
						},
						body: JSON.stringify({
							_id: settings._id,
							name: name,
							location: location,
							mobile: mobile
						})
					});
	
					let result = await response.json();
					message = result.message;
					setTimeout(() => {
						message = null;
					}, 3000);
				} catch (error) {
					console.error('error', error);
				}
			}}
		>
			<div class="md:flex md:items-center mb-6">
				<div class="md:w-1/3">
					<label
						class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
						for="inline-name"
					>
						Name
					</label>
				</div>
				<div class="md:w-2/3">
					<input
						class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
						id="inline-name"
						type="text"
						bind:value={name}
					/>
				</div>
			</div>
	
			<div class="md:flex md:items-center mb-6">
				<div class="md:w-1/3">
					<label
						class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
						for="inline-location"
					>
						Location
					</label>
				</div>
				<div class="md:w-2/3">
					<input
						class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
						id="inline-location"
						type="text"
						bind:value={location}
					/>
				</div>
			</div>
	
			<div class="md:flex md:items-center mb-6">
				<div class="md:w-1/3">
					<label
						class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
						for="inline-mobile"
					>
						Mobile
					</label>
				</div>
				<div class="md:w-2/3">
					<input
						class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
						id="inline-mobile"
						type="text"
						bind:value={mobile}
					/>
				</div>
			</div>
	
			<div class="md:flex md:items-center">
				<div class="md:w-1/3" />
				<div class="md:w-2/3">
					<button
						class="shadow bg-green-500 hover:bg-green-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
						type="submit"
					>
						Update
					</button>
				</div>
			</div>
		  
		</form>
	</div>
	{#if message}
		<div transition:fade class="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 mt-4 rounded-b" role="alert">
			<svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
			<p>{message}</p>
		</div>
	{/if}
</div>
