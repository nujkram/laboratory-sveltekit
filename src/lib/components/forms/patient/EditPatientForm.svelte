<script>
    // @ts-nocheck
	import Button from "$lib/components/reusable/Button.svelte";
	import { DateInput } from 'date-picker-svelte';
    import { onMount } from "svelte";
    import { saveOrQueue } from '$lib/client/saveOrQueue.js';

    export let isEditModalOpen = false;
    export let currentPatient;
    export let loadPatient = () => {};

    let _id = '';
    let firstName = '';
    let middleName = '';
    let lastName = '';
    let gender = '';
    let address = '';
    let birthDate = null;
    let saving = false;
    const minDob = new Date(1900, 0, 1);
    const maxDob = new Date();

    function setEditValues() {
        if (!currentPatient) return;
        _id = currentPatient._id;
        firstName = currentPatient.firstName || '';
        middleName = currentPatient.middleName || '';
        lastName = currentPatient.lastName || '';
        gender = currentPatient.gender || '';
        address = currentPatient.address || '';
        birthDate = currentPatient.birthDate ? new Date(currentPatient.birthDate) : null;
    }

    const handleCloseModal = () => (isEditModalOpen = false);

    async function handleSubmit(event) {
        event?.preventDefault();
        if (saving) return;
        saving = true;
        try {
            const res = await saveOrQueue({
                endpoint: '/api/admin/patient/update',
                entity: 'patient',
                isCreate: false,
                body: { _id, firstName, middleName, lastName, gender, birthDate, address, baseUpdated: currentPatient?.updated ?? null }
            });
            if (res.ok) {
                if (res.synced) loadPatient(); // offline: list refreshes after sync
                isEditModalOpen = false;
            }
        } catch (error) {
            console.error('error', error);
        } finally {
            saving = false;
        }
    }

    onMount(setEditValues);
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && isEditModalOpen && handleCloseModal()} />

<div class="fixed z-10 inset-0 overflow-y-auto {isEditModalOpen ? 'block' : 'hidden'}" on:click={handleCloseModal}>
	<div class="flex items-center justify-center min-h-screen p-4">
		<div class="fixed inset-0 bg-ink/40 backdrop-blur-sm" />
		<div class="relative z-50 w-full max-w-md rounded-xl border border-line bg-surface shadow-card-lg" on:click|stopPropagation>
			<button
				on:click={handleCloseModal}
				type="button"
				class="absolute top-3 right-2.5 inline-flex items-center rounded-lg p-1.5 text-muted transition-colors hover:bg-paper hover:text-ink"
			>
				<svg aria-hidden="true" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
				<span class="sr-only">Close</span>
			</button>
			<div class="px-6 py-6">
				<h3 class="mb-5 font-display text-lg font-bold text-ink">Edit patient</h3>
				<form class="space-y-4" on:submit={handleSubmit}>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="firstName" class="mb-1.5 block text-sm font-medium text-ink">First name</label>
							<input id="firstName" type="text" class="field" bind:value={firstName} required />
						</div>
						<div>
							<label for="lastName" class="mb-1.5 block text-sm font-medium text-ink">Last name</label>
							<input id="lastName" type="text" class="field" bind:value={lastName} required />
						</div>
					</div>
					<div>
						<label for="middleName" class="mb-1.5 block text-sm font-medium text-ink">Middle name</label>
						<input id="middleName" type="text" class="field" bind:value={middleName} />
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="gender" class="mb-1.5 block text-sm font-medium text-ink">Gender</label>
							<select id="gender" class="field" bind:value={gender}>
								<option value="">Select…</option>
								<option value="Male">Male</option>
								<option value="Female">Female</option>
							</select>
						</div>
						<div>
							<label for="birthDate" class="mb-1.5 block text-sm font-medium text-ink">Birth date</label>
							<DateInput bind:value={birthDate} min={minDob} max={maxDob} format="yyyy-MM-dd" placeholder="Select date" />
						</div>
					</div>
					<div>
						<label for="address" class="mb-1.5 block text-sm font-medium text-ink">Address</label>
						<input id="address" type="text" class="field" bind:value={address} />
					</div>
					<div class="flex justify-end gap-2 pt-2">
						<button
							type="button"
							on:click={handleCloseModal}
							class="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-card transition-colors hover:bg-paper"
						>
							Cancel
						</button>
						<Button color="success" text={saving ? 'Saving…' : 'Save changes'} disabled={saving} />
					</div>
				</form>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.date-time-field input) {
		border-radius: 0.5rem;
		border: 1px solid #e1e8de;
		padding: 0.625rem 0.875rem;
		font-size: 0.875rem;
		color: #142218;
		width: 100%;
	}
	:global(.date-time-field input:focus) {
		border-color: #46a02e;
		outline: none;
		box-shadow: 0 0 0 2px rgba(70, 160, 46, 0.25);
	}
</style>
