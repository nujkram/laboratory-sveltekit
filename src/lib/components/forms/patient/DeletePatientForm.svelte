<script>
    // @ts-nocheck
	import Button from "$lib/components/reusable/Button.svelte";

    export let isConfirmModalOpen = false;
    export let currentPatient;
    export let loadPatient = () => {};

    const patient = currentPatient;
    const _id = patient._id;

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
		<div class="fixed inset-0 bg-gray-800 bg-opacity-25" />
        <div id="confirm-modal" tabindex="-1" class="fixed inset-0 z-50 w-full flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full">
            <div class="relative w-full h-full max-w-md md:h-auto">
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button 
                        class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" 
                        type="button" 
                        data-modal-hide="confirm-modal"
                        on:click={handleCloseModal}
                        >
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" ><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                    <div class="p-6 text-center">
                        <svg aria-hidden="true" class="mx-auto mb-4 text-gray-400 w-14 h-14 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h2 class="mb-2 text-lg font-normal text-gray-800 dark:text-gray-400">{currentPatient.name}</h2>
                        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this gender?</h3>
                        <Button
                            extraClasses="focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg"
                            textColor="text-white"
                            bgColor="bg-red-600"
                            bgColorHover="bg-red-800"
                            textSize="text-sm"
                            borderColor="bg-red-600"
                            borderColorHover="bg-red-800"
                            on:click={handleConfirmDelete}
                            >
                            Yes
                        </Button>
                        <Button
                            extraClasses="ml-2 pr-3 pl-3 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 "
                            textColor="text-gray-500"
                            bgColor="bg-white"
                            bgColorHover="bg-gray-100"
                            textSize="text-sm"
                            borderColor="border-gray-200"
                            on:click={handleCloseModal}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>