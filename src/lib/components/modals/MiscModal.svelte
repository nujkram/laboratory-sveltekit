<script>
    // @ts-nocheck
	import { calculateAge } from "$lib/utils/ageHelper";
    import { formatDateMDY } from '$lib/utils/dateHelper.js';
    export let isViewModalOpen = false;
    export let data;

    let age = calculateAge(data?.patient?.birthDate);
    const handleCloseModal = () => isViewModalOpen = false;

    function printModal() {
        const printModal = document.querySelector('nav');
        const navModal = document.querySelector('#nav-modal');
        printModal.classList.toggle('hidden');
        navModal.classList.toggle('hidden');
        window.print();
        printModal.classList.toggle('hidden');
        navModal.classList.toggle('hidden');
    }
</script>

<div class="fixed z-10 inset-0 overflow-y-auto {isViewModalOpen ? 'block': 'hidden'}">
    <div class="flex items-center justify-center min-h-screen">
		<div class="fixed inset-0 bg-gray-800 bg-opacity-25" />
        <div 
            class="fixed inset-0 z-50 w-full flex items-center justify-center p-4 mt-8 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full"
            
            tabindex="-1" 
            aria-hidden="true" >
            <div class="relative w-full h-full max-w-4xl md:h-auto">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div id="nav-modal">
                        <button
                        class="absolute top-3 left-2.5 bg-blue-500 text-white px-4 py-2 rounded"
                        on:click={printModal}
                        >
                        Print Modal
                    </button>
                    <button on:click={handleCloseModal} type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="authentication-modal">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                    </div>
                    <div class="px-6 py-6 lg:px-8"> 
                        <div class="flex flex-col justify-center items-center gap-0">
                            <div class="text-m uppercase font-semibold text-gray-900 dark:text-white leading-none m-0 p-0">Medical Mission Group</div>
                            <div class="text-xs font-normal text-gray-900 dark:text-white leading-none m-0 p-0">Services Cooperative of Roxas City and Capiz</div>
                            <div class="text-xs font-normal text-gray-900 dark:text-white leading-none m-0 p-0">Washington St., Roxas City Tel. No. (036) 6215-798</div>
                            <div class="text-xs font-semibold text-gray-900 dark:text-white leading-none m-0 p-0">LABORATORY DEPARTMENT</div>
                        </div>
                        <div class="text-center bg-blue-600 mt-1 uppercase font-semibold">
                            {data?.category}
                        </div>
                        <div class="grid grid-cols-12 px-2 flex-row border-b-2 border-black pt-2 w-full">
                            <div class="col-span-5">
                                <div class="flex gap-1">
                                    <div class = "text-right w-32">Name:</div>
                                    <div class="font-semibold">{data?.patient?.completeName || ''}</div>
                                </div>
                            </div>
                            <div class="col-span-2">
                                <div class="flex gap-1">
                                    <div class = "text-right w-32">Requested By:</div>
                                    <div class="font-semibold"> </div>
                                </div>
                            </div>
                            <div class="col-span-4">
                            </div>

                            <div class="col-span-5">
                                <div class="flex gap-1 ">
                                    <div class = "text-right w-32">Gender:</div>
                                    <div class="font-semibold">{data?.patient?.gender || '--'}</div>
                                </div>
                            </div>

                            <div class="col-span-3">
                                <div class="flex gap-1">
                                    <div class = "text-right w-32">Age:</div>
                                    <div class="font-semibold">{age || '--'}</div>
                                </div>
                            </div>

                            <div class="col-span-4">
                                <div class="flex gap-1">
                                    <div class = "text-right w-44">Date:</div>
                                    <div class="font-semibold">{formatDateMDY(data?.created) || '--'}</div>
                                </div>
                            </div>


                            <div class="col-span-5">
                                <div class="flex gap-1">
                                    <div class = "text-right w-32">Exam Desired:</div>
                                    <div class="font-semibold">{data?.exam || '--'}</div>
                                </div>
                            </div>


                            <div class="col-span-3">
                                <div class="flex gap-1">
                                    <div class = "text-right w-32">Specimen:</div>
                                    <div class="font-semibold">{data?.specimen || '--'}</div>
                                </div>
                            </div>

                            
                            <div class="col-span-3">
                                <div class="flex gap-1">
                                    <div class = "text-right w-44">Case No:</div>
                                    <div class="font-semibold">{data?.caseNumber || '--'}</div>
                                </div>
                            </div>

                        

                            
                        </div>

                        <div class="px-6 py-6 lg:px-0 ">

                            <div class="grid grid-cols-12 px-2 flex-row border-b-2 border-black pt-2 w-full lg:py-7">
                                <div class="col-span-2">
                                </div>
                                <div class="col-span-6">
                                    <div class="flex gap-1">
                                        <div class="font-semibold">ANTI-HAV DETERMINATION</div>
                                    </div>
                                </div>

                                <div class="col-span-6">
                                    <div>
                                        <div class ="text-right w-81">(SD Bioline HAV IgG/IgM Rapid Test)</div>
                                    </div>
                                </div>

                                <div class="col-span-10">
                                    <div class="flex-col">
                                        <div class="flex gap-1">
                                            <div class="w-5/12 text-right font-semibold">IgG</div>
                                            <div class="w-4/12 font-semibold border-b border-black text-right">{data?.result || '--'}</div>
                                        </div>
                                        <div class="flex gap-1">
                                            <div class="w-5/12 text-right font-semibold">IgM</div>
                                            <div class="w-4/12 font-semibold border-b border-black text-right">{data?.others || '--'}</div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            
                        

                        
                                
                        </div>
                       
                        <div class="flex text-xs mt-8">
                            <div class="w-2/12 text-right">
                                Noted by
                            </div>
                            <div class="w-5/12 text-center">
                                <div class="font-semibold uppercase">{data?.pathologist?.profile?.displayName || '--'}</div>
                                <div>{data?.pathologist?.license || '--'}</div>
                                <div>Pathologist</div>
                            </div>
                            <div class="w-5/12 text-center">
                                <div class="font-semibold uppercase">{data?.medicalTechnologist?.profile?.displayName || '--'}</div>
                                <div>{data?.medicalTechnologist?.license || '--'}</div>
                                <div>Medical Technologist</div>
                            </div>
                        </div>
                        <div class="flex text-xs mt-4">
                            <div class="w-3/12">
                                Encoded by: {data?.createdBy?.profile?.displayName || '--'}
                            </div>
                            <div class="w-6/12 text-center">
                                ***Please correlate clinically. May confirm with other test/method. If necessary.
                            </div>
                            <div class="w-3/12 text-right">
                                Date Printed: {formatDateMDY(Date.now())}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div> 
    </div>
</div>

<style>

@media print {
  #print-record-modal,
  #print-record-modal * {
    visibility: visible;
  }

  /* Optional: Adjust the size and position of the print modal for printing */
  #print-record-modal {
    width: 80%;
    top: 10%;
    left: 10%;
  }
}

</style>