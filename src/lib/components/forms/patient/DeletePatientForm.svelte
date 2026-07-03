<script>
    // @ts-nocheck
	import Button from "$lib/components/reusable/Button.svelte";

    export let isConfirmModalOpen = false;
    export let currentPatient;
    export let loadPatient = () => {};

    const patient = currentPatient;
    const _id = patient._id;
    console.log('currentPatient', currentPatient)
    const handleCloseModal = () => isConfirmModalOpen = false;
    

    async function handleConfirmDelete(event)
    {
		event?.preventDefault();
		const response = await fetch('/api/admin/patient/delete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({_id})
		});
		let result = await response.json();
		isConfirmModalOpen = false;
		if (result.status === 'Success') {
            loadPatient();
		}
    }

</script>

<div class="fixed z-10 inset-0 overflow-y-auto {isConfirmModalOpen? 'block': 'hidden'}">
	<div class="flex items-center justify-center min-h-screen">
		<div class="fixed inset-0 bg-ink/40 backdrop-blur-sm" />
        <div id="confirm-modal" tabindex="-1" class="fixed inset-0 z-50 w-full flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full">
            <div class="relative w-full h-full max-w-md md:h-auto">
                <div class="relative rounded-xl border border-line bg-surface shadow-card-lg">
                    <button
                        class="absolute top-3 right-2.5 inline-flex items-center rounded-lg p-1.5 text-muted transition-colors hover:bg-paper hover:text-ink"
                        type="button"
                        data-modal-hide="confirm-modal"
                        on:click={handleCloseModal}
                        >
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" ><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                    <div class="p-6 text-center">
                        <span class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
                            <svg aria-hidden="true" class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </span>
                        <h2 class="mb-1 font-display text-lg font-bold text-ink">{currentPatient?.completeName}</h2>
                        <h3 class="mb-6 text-sm text-muted">Delete this patient? This can't be undone.</h3>
                        <div class="flex justify-center gap-2">
                            <Button color='secondary' text='Cancel' on:click={handleCloseModal} />
                            <Button color='danger' text='Delete patient' on:click={handleConfirmDelete} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>