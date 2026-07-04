<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { SHA256 } from 'crypto-js';
	import Button from '$lib/components/reusable/Button.svelte';

	export let isEditModalOpen = false;
	export let currentUser;
	export let loadUsers = () => {};

	let roles = [];
	let saving = false;
	let message = null;
	let alertColor = 'green';

	let _id = '';
	let firstName = '';
	let middleName = '';
	let lastName = '';
	let email = '';
	let phone = '';
	let province = '';
	let country = '';
	let license = '';
	let title = '';
	let role = '';
	let newPassword = '';
	let confirmNewPassword = '';

	function setEditValues() {
		if (!currentUser) return;
		_id = currentUser._id;
		firstName = currentUser.profile?.firstName || '';
		middleName = currentUser.profile?.middleName || '';
		lastName = currentUser.profile?.lastName || '';
		email = currentUser.profile?.email || currentUser.emails?.[0]?.address || '';
		phone = currentUser.profile?.phone || '';
		province = currentUser.profile?.province || '';
		country = currentUser.profile?.country || '';
		license = currentUser.license || '';
		role = currentUser.role || '';
		// Prefill credentials. Older records bake them into displayName (after a
		// comma) rather than a title field — recover them so a save doesn't drop them.
		title = currentUser.profile?.title || '';
		if (!title && currentUser.profile?.displayName?.includes(',')) {
			title = currentUser.profile.displayName.split(',').slice(1).join(',').trim();
		}
	}

	const handleCloseModal = () => (isEditModalOpen = false);

	function flash(text, color) {
		message = text;
		alertColor = color;
		setTimeout(() => {
			message = null;
		}, 3000);
	}

	async function handleSubmit(event) {
		event?.preventDefault();

		// Password reset is optional — only validate/send it when a value is entered.
		if (newPassword || confirmNewPassword) {
			if (newPassword.length < 6) {
				flash('New password must be at least 6 characters.', 'red');
				return;
			}
			if (newPassword !== confirmNewPassword) {
				flash('New passwords do not match.', 'red');
				return;
			}
		}

		saving = true;
		try {
			const response = await fetch('/api/admin/user/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					_id,
					firstName,
					middleName,
					lastName,
					email,
					phone,
					province,
					country,
					license,
					title,
					role,
					newPassword: newPassword ? SHA256(newPassword).toString() : undefined
				})
			});
			const result = await response.json();
			if (result.status === 'Success') {
				flash(result.message, 'green');
				setTimeout(() => {
					loadUsers();
					isEditModalOpen = false;
				}, 800);
			} else {
				flash(result.message || 'Something went wrong.', 'red');
			}
		} catch (error) {
			flash('Something went wrong. Please try again.', 'red');
		} finally {
			saving = false;
		}
	}

	async function loadRoles() {
		try {
			const response = await fetch('/api/admin/role', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});
			const result = await response.json();
			roles = result.response;
		} catch (error) {
			console.error('error', error);
		}
	}

	onMount(() => {
		setEditValues();
		loadRoles();
	});
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && isEditModalOpen && handleCloseModal()} />

<div class="fixed z-10 inset-0 overflow-y-auto {isEditModalOpen ? 'block' : 'hidden'}">
	<div class="flex items-center justify-center min-h-screen p-4">
		<div class="fixed inset-0 bg-ink/40 backdrop-blur-sm" on:click={handleCloseModal} />
		<div class="relative z-50 w-full max-w-lg rounded-xl border border-line bg-surface shadow-card-lg">
			<button
				on:click={handleCloseModal}
				type="button"
				class="absolute top-3 right-2.5 inline-flex items-center rounded-lg p-1.5 text-muted transition-colors hover:bg-paper hover:text-ink"
			>
				<svg aria-hidden="true" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
				<span class="sr-only">Close</span>
			</button>
			<div class="px-6 py-6">
				<h3 class="mb-5 font-display text-lg font-bold text-ink">Edit user</h3>
				<form class="space-y-4" on:submit={handleSubmit}>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="edit-firstName" class="mb-1.5 block text-sm font-medium text-ink">First name</label>
							<input id="edit-firstName" type="text" class="field" bind:value={firstName} required />
						</div>
						<div>
							<label for="edit-lastName" class="mb-1.5 block text-sm font-medium text-ink">Last name</label>
							<input id="edit-lastName" type="text" class="field" bind:value={lastName} required />
						</div>
					</div>
					<div>
						<label for="edit-middleName" class="mb-1.5 block text-sm font-medium text-ink">Middle name</label>
						<input id="edit-middleName" type="text" class="field" bind:value={middleName} />
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="edit-email" class="mb-1.5 block text-sm font-medium text-ink">Email</label>
							<input id="edit-email" type="email" class="field" bind:value={email} />
						</div>
						<div>
							<label for="edit-phone" class="mb-1.5 block text-sm font-medium text-ink">Phone</label>
							<input id="edit-phone" type="tel" class="field" bind:value={phone} />
						</div>
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="edit-province" class="mb-1.5 block text-sm font-medium text-ink">Province</label>
							<input id="edit-province" type="text" class="field" bind:value={province} />
						</div>
						<div>
							<label for="edit-country" class="mb-1.5 block text-sm font-medium text-ink">Country</label>
							<input id="edit-country" type="text" class="field" bind:value={country} />
						</div>
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="edit-license" class="mb-1.5 block text-sm font-medium text-ink">License</label>
							<input id="edit-license" type="text" class="field" bind:value={license} placeholder="Lic# 0000000" />
						</div>
						<div>
							<label for="edit-title" class="mb-1.5 block text-sm font-medium text-ink">Title / Credentials</label>
							<input id="edit-title" type="text" class="field" bind:value={title} placeholder="MD, FPSP · RMT · DTA" />
						</div>
					</div>
					<div>
						<label for="edit-role" class="mb-1.5 block text-sm font-medium text-ink">Role</label>
						<select id="edit-role" class="field" bind:value={role}>
								<option value="" disabled>Select an option</option>
								{#key roles}
									{#if roles.length}
										{#each roles as r}
											<option value={r.name}>{r.name}</option>
										{/each}
									{/if}
								{/key}
							</select>
						</div>

					<div class="border-t border-line pt-4">
						<p class="mb-1 text-sm font-semibold text-ink">Reset password</p>
						<p class="mb-3 text-xs text-muted">Leave blank to keep the current password.</p>
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label for="edit-newPassword" class="mb-1.5 block text-sm font-medium text-ink">New password</label>
								<input id="edit-newPassword" type="password" autocomplete="new-password" class="field" bind:value={newPassword} />
							</div>
							<div>
								<label for="edit-confirmNewPassword" class="mb-1.5 block text-sm font-medium text-ink">Confirm password</label>
								<input id="edit-confirmNewPassword" type="password" autocomplete="new-password" class="field" bind:value={confirmNewPassword} />
							</div>
						</div>
					</div>

					<div class="flex justify-end gap-2 pt-2">
						<Button color="secondary" text="Cancel" on:click={handleCloseModal} />
						<Button color="success" text={saving ? 'Saving…' : 'Save changes'} />
					</div>
				</form>
				{#if message}
					<div transition:fade class="flex items-center bg-{alertColor}-500 text-white text-sm font-bold px-4 py-3 mt-4 rounded" role="alert">
						<svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
						<p>{message}</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
