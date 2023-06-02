<script>
    // @ts-nocheck
	import Button from "$lib/components/reusable/Button.svelte";
    import { onMount } from "svelte";

    export let isEditModalOpen = false;
    export let currentPatient;
    export let loadPatient = () => {};

    let _id = '';
    let name = '';
    let description = '';

    function setEditValues()
    {
        if(currentPatient === undefined)
        {
            currentPatient = [
                {_id:"NA"},
                {name:"NA"},
                {description:"NA"}
            ]
        }
        _id = currentPatient._id;
        name = currentPatient.name;
        description = currentPatient.description;

    }

    const handleCloseModal = () => isEditModalOpen = false;

    async function handleSubmit(event)
    {
        console.log(gender);
        console.log(description);
		event?.preventDefault();
		const response = await fetch('/api/admin/patient/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
                _id,
				gender,
                description
			})
		});
		let result = await response.json();
		isEditModalOpen = false;
		if (result.status === 'Success') {
            loadPatient();
		}
    }

    onMount(() => {
        setEditValues();
    });

</script>

<div class="fixed z-10 inset-0 overflow-y-auto {isEditModalOpen? 'block': 'hidden'}">
	<div class="flex items-center justify-center min-h-screen">
		<div class="fixed inset-0 bg-gray-800 bg-opacity-25" />
        <div 
            class="fixed inset-0 z-50 w-full flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full"
            id="updated-patient-modal" 
            tabindex="-1" 
            aria-hidden="true" >
            <div class="relative w-full h-full  max-w-md md:h-auto">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button on:click={handleCloseModal} type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="authentication-modal">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                    <div class="px-6 py-6 lg:px-8"> 
                        <div class="flex justify-center items-start">
                            <h3 class="mb-4 text-m uppercase font-semibold text-gray-900 dark:text-white">Edit Patient</h3>
                        </div>
                        <form class="space-gender-6" on:submit={handleSubmit}>
                            <div>
                                <label for="text" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Patient</label>
                                <input 
                                    class="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                    type="text" 
                                    name="gender" 
                                    id="gender"
                                    bind:value={name} 
                                    required
                                >
                            </div>
                            <div>
                                <label for="text" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                                <textarea 
                                    class="mb-4 block resize-none p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    type="text"
                                    id="description"
                                    name="description" 
                                    bind:value={description} 
                                    rows="5"
                                    required
                                ></textarea>
                            </div>
                            <div class="grid grid-cols-4">
                                <Button color='success' textSize='text-md' text='Update' />
                                <Button color='primary' textSize='text-md' text='Close' on:click={handleCloseModal} />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div> 
    </div>
</div>