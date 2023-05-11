<script>
    // @ts-nocheck
	import { fade } from 'svelte/transition';
	import Button from "$lib/components/reusable/Button.svelte";
	import { DateInput} from 'date-picker-svelte';
	import { goto } from '$app/navigation';

    let firstName, middleName, lastName, gender, address, message;
	let birthDate = new Date();
</script>
<div class="border border-gray-200 rounded mr-4 pt-4">
    <form
		class="w-full max-w-2xl mb-4"
		on:submit|preventDefault={async () => {
			try {
				let response = await fetch('/api/admin/patient/insert', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						firstName: firstName,
						middleName: middleName,
						lastName: lastName,
						gender: gender,
						birthDate: birthDate,
						address: address
					})
				});

                let result = await response.json();
                message = result.message;
				setTimeout(() => {
					message = null;
					goto('/patients')
				}, 3000);
			} catch (error) {
				console.error('error', error);
			}
		}}
	>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
					for="inline-firstName"
				>
					First Name
				</label>
			</div>
			<div class="md:w-9/12">
				<input
					class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
					id="inline-firstName"
					type="text"
					bind:value={firstName}
				/>
			</div>
		</div>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
					for="inline-middleName"
				>
					Middle Name
				</label>
			</div>
			<div class="md:w-9/12">
				<input
					class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
					id="inline-middleName"
					type="text"
					bind:value={middleName}
				/>
			</div>
		</div>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
					for="inline-lastName"
				>
					Last Name
				</label>
			</div>
			<div class="md:w-9/12">
				<input
					class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
					id="inline-lastName"
					type="text"
					bind:value={lastName}
				/>
			</div>
		</div>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
					for="inline-gender"
				>
					Gender
				</label>
			</div>
			<div class="md:w-9/12">
				<select class="bg-gray-200 appearnace-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500">
					<option value="Male">Male</option>
					<option value="Female">Female</option>
				</select>
			</div>
		</div>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
					for="inline-birthDate"
				>
					Birth Date
				</label>
			</div>
			<div class="md:w-9/12">
				<DateInput class="" bind:value={birthDate} />
			</div>
		</div>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
					for="inline-address"
				>
					Address
				</label>
			</div>
			<div class="md:w-9/12">
				<input
					class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
					id="inline-address"
					type="text"
					bind:value={address}
				/>
			</div>
		</div>

		<div class="md:flex md:items-center">
			<div class="md:w-3/12" />
			<div class="md:w-9/12 text-right">
                <Button type='button' bgColor='bg-green-500' textSize='text-xs' text="Submit" />
			</div>
		</div>
      
	</form>
    {#if message}
        <div transition:fade class="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 mt-4 rounded-b" role="alert">
            <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
            <p>{@html message}</p>
        </div>
    {/if}
</div>

<style>
	:root {
		--date-input-width: 100%;
		--date-picker-background: #e5e7eb;
		--date-picker-foreground: #374151;
	}
</style>