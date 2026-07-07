<script>
    // @ts-nocheck
	import { fade } from 'svelte/transition';
	import Button from '$lib/components/reusable/Button.svelte';

	export let isConfirmModalOpen = false;
	export let currentPatient;
	export let loadPatient = () => {};
	// Deactivate is open to all staff; permanent delete is admin-only (also
	// enforced server-side). Hides the permanent-delete path for non-admins.
	export let isAdmin = false;

	let saving = false;
	let message = null;
	let typed = '';

	$: _id = currentPatient?._id;
	$: canHardDelete = typed.trim().toUpperCase() === 'DELETE' && !saving;

	const handleCloseModal = () => {
		if (saving) return;
		typed = '';
		isConfirmModalOpen = false;
	};

	async function handleConfirmDelete(hard = false) {
		if (hard && !canHardDelete) return;
		saving = true;
		message = null;
		try {
			const response = await fetch('/api/admin/patient/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ _id, hard })
			});
			const result = await response.json();
			if (result.status === 'Success') {
				typed = '';
				isConfirmModalOpen = false;
				loadPatient();
			} else {
				message = result.message || 'Something went wrong.';
			}
		} catch (error) {
			message = 'Something went wrong. Please try again.';
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
				<h3 class="mt-4 font-display text-lg font-bold text-ink">Deactivate patient</h3>
				<p class="mt-2 text-sm text-muted">
					Deactivate <span class="font-semibold text-ink">{currentPatient?.completeName}</span>? They will be
					hidden from the active list. You can reactivate them later.
				</p>

				{#if message}
					<div transition:fade class="mt-4 flex items-center justify-center rounded bg-danger/10 px-4 py-3 text-sm font-medium text-danger" role="alert">
						<p>{message}</p>
					</div>
				{/if}

				<div class="mt-6 flex justify-center gap-2">
					<Button color="secondary" text="Cancel" on:click={handleCloseModal} disabled={saving} />
					<Button color="danger" text={saving ? 'Deactivating…' : 'Deactivate'} on:click={() => handleConfirmDelete(false)} disabled={saving} />
				</div>

				<!-- Irreversible cleanup path (e.g. removing a duplicate patient). Note: this
				     removes the patient only — their lab records are not deleted. -->
				{#if isAdmin}
				<details class="mt-5 border-t border-line pt-4 text-left">
					<summary class="cursor-pointer text-xs font-semibold text-danger">Delete permanently instead</summary>
					<p class="mt-2 text-xs text-muted">
						Permanently removes this patient. This <span class="font-semibold text-danger">cannot be undone</span>,
						and does not remove their lab records.
					</p>
					<label for="patient-hard-confirm" class="mt-3 mb-1.5 block text-xs font-medium text-muted">
						Type <span class="font-mono font-semibold text-ink">DELETE</span> to confirm
					</label>
					<input
						id="patient-hard-confirm"
						type="text"
						autocomplete="off"
						bind:value={typed}
						class="field"
						placeholder="DELETE"
					/>
					<div class="mt-3 flex justify-end">
						<Button color="danger" text={saving ? 'Deleting…' : 'Delete permanently'} disabled={!canHardDelete} on:click={() => handleConfirmDelete(true)} />
					</div>
				</details>
				{/if}
			</div>
		</div>
	</div>
</div>
