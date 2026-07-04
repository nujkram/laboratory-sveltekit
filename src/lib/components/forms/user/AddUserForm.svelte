<script>
    // @ts-nocheck
	import {onMount} from 'svelte';
	import { fade } from 'svelte/transition';
	import Button from "$lib/components/reusable/Button.svelte";

    export let isAddModalOpen = false;
    export let title;
	export let loadUsers = () => {};
    import { SHA256 } from 'crypto-js';
	let roles = [];
	let message = null;
	let alertColor = 'green';
    let license = '',
		credential = '',
		firstName = '',
		middleName = '',
		lastName = '',
		username = '',
		email = '',
		phone = '',
		province = '',
		country = '',
		password = '',
		confirmPassword = '',
		role = '';

    const handleCloseModal = () => isAddModalOpen = false;

    async function handleSubmit(event) {
		event?.preventDefault();
		if (password !== confirmPassword) {
			message = 'Passwords do not match';
			alertColor = 'red';
			setTimeout(() => {
				message = null;
			}, 3000);
			return;
		}

		if(role === '') {
			message = 'Please select a role';
			alertColor = 'red';
			setTimeout(() => {
				message = null;
			}, 3000);
			return;
		}

		// const salt = await bcrypt.genSalt(saltCount);
		const hashedPassword = await SHA256(password).toString();
		// const bcryptPass = await bcrypt.hash(hashedPassword, salt);

		const response = await fetch('/api/admin/user/insert', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				license,
				title: credential,
				firstName,
				middleName,
				lastName,
				username,
				password: hashedPassword,
				phone,
				province,
				country,
				email,
				role,
			})
		});
		let result = await response.json();

		if (result.status === 'Success') {
			alertColor = 'green';
			message = result.message;
			setTimeout(() => {
				message = null;
				loadUsers();
				handleCloseModal();
			}, 3000);
		}
	}

    async function loadRoles() {
		try {
			let response = await fetch('/api/admin/role', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			let result = await response.json();
			roles = result.response;
		} catch (error) {
			console.error('error', error);
		}
	}

    onMount(async () => {
		loadRoles();
    });
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && isAddModalOpen && handleCloseModal()} />

<div class="fixed z-10 inset-0 overflow-y-auto {isAddModalOpen? 'block': 'hidden'} pt-20" on:click={handleCloseModal}>
	<div class="flex items-center justify-center min-h-screen">
		<div class="fixed inset-0 bg-ink/40 backdrop-blur-sm" />
		<div
			class="relative w-full max-w-lg transform overflow-hidden rounded-xl border border-line bg-surface shadow-card-lg transition-all"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-headline"
			on:click|stopPropagation
		>
			<button
				type="button"
				on:click={handleCloseModal}
				class="absolute top-3 right-3 inline-flex items-center rounded-lg p-1.5 text-muted transition-colors hover:bg-paper hover:text-ink"
			>
				<svg aria-hidden="true" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
				<span class="sr-only">Close</span>
			</button>
			<div class="p-6">
				<h2 class="font-display text-lg font-bold text-ink" id="modal-headline">
					{title}
				</h2>
				<div class="mt-4">
					<form class="max-w-lg mx-auto" on:submit={handleSubmit}>
						<div class="mb-4 grid grid-cols-2 gap-3">
							<div>
								<label for="license" class="mb-1.5 block text-sm font-medium text-ink">License</label>
								<input type="text" id="license" name="license" bind:value={license} placeholder="Lic# 0000000" class="field" />
							</div>
							<div>
								<label for="title" class="mb-1.5 block text-sm font-medium text-ink">Title / Credentials</label>
								<input type="text" id="title" name="title" bind:value={credential} placeholder="MD, FPSP · RMT · DTA" class="field" />
							</div>
						</div>
						<div class="mb-4">
							<label for="firstName" class="mb-1.5 block text-sm font-medium text-ink">First Name:</label>
							<input
								type="text"
								id="firstName"
								name="firstName"
								bind:value={firstName}
								class="field"
							/>
						</div>
						<div class="mb-4">
							<label for="middleName" class="mb-1.5 block text-sm font-medium text-ink">Middle Name:</label>
							<input
								type="text"
								id="middleName"
								name="middleName"
								bind:value={middleName}
								class="field"
							/>
						</div>
						<div class="mb-4">
							<label for="lastName" class="mb-1.5 block text-sm font-medium text-ink">Last Name:</label>
							<input
								type="text"
								id="lastName"
								name="lastName"
								bind:value={lastName}
								class="field"
							/>
						</div>
						<div class="mb-4">
							<label for="username" class="mb-1.5 block text-sm font-medium text-ink">Username:</label>
							<input
								type="text"
								id="username"
								name="username"
								bind:value={username}
								class="field"
							/>
						</div>
						<div class="mb-4">
							<label for="password" class="mb-1.5 block text-sm font-medium text-ink">Password:</label>
							<input
								type="password"
								id="password"
								name="password"
								bind:value={password}
								class="field"
							/>
						</div>
						<div class="mb-4">
							<label for="confirm-password" class="mb-1.5 block text-sm font-medium text-ink">Confirm Password:</label>
							<input
								type="password"
								id="confirm-password"
								name="confirmPassword"
								bind:value={confirmPassword}
								class="field"
							/>
						</div>
						<div class="mb-4">
							<label for="email" class="mb-1.5 block text-sm font-medium text-ink">Email:</label>
							<input
								type="email"
								id="email"
								name="email"
								bind:value={email}
								class="field"
							/>
						</div>
						<div class="mb-4">
							<label for="phone" class="mb-1.5 block text-sm font-medium text-ink">Phone Number:</label>
							<input
								type="tel"
								id="phone"
								name="phone"
								bind:value={phone}
								class="field"
							/>
							<div class="mb-4">
								<label for="province" class="mb-1.5 block text-sm font-medium text-ink">Province:</label>
								<input
									type="text"
									id="province"
									name="province"
									bind:value={province}
									class="field"
								/>
							</div>
							<div class="mb-4">
								<label for="country" class="mb-1.5 block text-sm font-medium text-ink">Country:</label>
								<select
									id="country"
									name="country"
									bind:value={country}
									class="field"
								>
									<option value="" disabled selected>Select an option</option>
									<option value="Argentina">Argentina</option>
									<option value="Australia">Australia</option>
									<option value="Brazil">Brazil</option>
									<option value="Chinese">Chinese</option>
									<option value="Italy">Italy</option>
									<option value="Japan">Japan</option>
									<option value="Philippines">Philippines</option>
									<option value="South Korea">South Korea</option>
								</select>
							</div>
							<div class="mb-4">
								<label for="role" class="mb-1.5 block text-sm font-medium text-ink">Role:</label>
								<select
									id="role"
									name="role"
									bind:value={role}
									class="field"
								>
									<option value="" disabled selected>Select an option</option>
									{#key roles}
										{#if roles.length}
											{#each roles as role}
												<option value="{role.name}">{role.name}</option>
											{/each}
										{/if}
									{/key}
								</select>
							</div>
						</div>
						<div class="flex justify-end gap-2 pt-2">
							<button
								type="button"
								on:click={handleCloseModal}
								class="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-card transition-colors hover:bg-paper"
							>
								Cancel
							</button>
							<Button color='success' text='Add user' />
						</div>
					</form>
					{#if message}
						<div transition:fade class="flex items-center bg-{alertColor}-500 text-white text-sm font-bold px-4 py-3 mt-4 rounded-b" role="alert">
							<svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
							<p>{message}</p>
						</div>
					{/if}
				</div>
			</div>
			
		</div>
	</div>
</div>