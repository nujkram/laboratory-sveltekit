<script>
	// @ts-nocheck
	import { fade } from 'svelte/transition';
	import Button from '$lib/components/reusable/Button.svelte';

	export let isConfirmModalOpen = false;
	export let currentUser;
	export let loadUsers = () => {};

	let saving = false;
	let message = null;
	let alertColor = 'red';

	const handleCloseModal = () => (isConfirmModalOpen = false);

	$: fullName =
		[currentUser?.profile?.firstName, currentUser?.profile?.lastName].filter(Boolean).join(' ') ||
		currentUser?.profile?.displayName ||
		'this user';

	function flash(text, color) {
		message = text;
		alertColor = color;
		setTimeout(() => {
			message = null;
		}, 3000);
	}

	async function handleDelete() {
		saving = true;
		try {
			const response = await fetch('/api/admin/user/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ _id: currentUser?._id })
			});
			const result = await response.json();
			if (result.status === 'Success') {
				loadUsers();
				isConfirmModalOpen = false;
			} else {
				flash(result.message || 'Something went wrong.', 'red');
			}
		} catch (error) {
			flash('Something went wrong. Please try again.', 'red');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && isConfirmModalOpen && handleCloseModal()} />

<div class="fixed z-10 inset-0 overflow-y-auto {isConfirmModalOpen ? 'block' : 'hidden'}">
	<div class="flex items-center justify-center min-h-screen p-4">
		<div class="fixed inset-0 bg-ink/40 backdrop-blur-sm" on:click={handleCloseModal} />
		<div class="relative z-50 w-full max-w-md rounded-xl border border-line bg-surface shadow-card-lg">
			<div class="px-6 py-6 text-center">
				<span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.94l-7.5 12.99A1.5 1.5 0 004.14 19.5h15.72a1.5 1.5 0 001.3-2.57l-7.5-12.99a1.5 1.5 0 00-2.62 0z" />
					</svg>
				</span>
				<h3 class="mt-4 font-display text-lg font-bold text-ink">Deactivate user</h3>
				<p class="mt-2 text-sm text-muted">
					Are you sure you want to deactivate <span class="font-semibold text-ink">{fullName}</span>? They will
					no longer be able to sign in. You can reactivate them later by editing the user.
				</p>

				{#if message}
					<div transition:fade class="mt-4 flex items-center justify-center bg-{alertColor}-500 text-white text-sm font-bold px-4 py-3 rounded" role="alert">
						<p>{message}</p>
					</div>
				{/if}

				<div class="mt-6 flex justify-center gap-2">
					<Button color="secondary" text="Cancel" on:click={handleCloseModal} />
					<Button color="danger" text={saving ? 'Deactivating…' : 'Deactivate'} on:click={handleDelete} />
				</div>
			</div>
		</div>
	</div>
</div>
