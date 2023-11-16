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

<div class="fixed z-10 inset-0 {isViewModalOpen ? 'block': 'hidden'}">
    <div class="flex items-center justify-center min-h-screen">
      <div class="fixed inset-0 bg-gray-800 bg-opacity-25" />
      <div class="fixed inset-0 z-50 w-full flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full" tabindex="-1" aria-hidden="true">
        <div class="relative w-full h-full max-w-4xl md:h-auto mt-[30%]">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700" id="print-record-modal">
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
                        <div class="text-center bg-red-800 mt-1 uppercase font-semibold">
                            {data?.category}
                        </div>
                        <div class="grid grid-cols-12 px-2 text-sm">
                            <div class="col-span-4">
                                <div class="flex gap-1">
                                    <div>Name:</div>
                                    <div class="font-semibold">{data?.patient?.completeName || ''}</div>
                                </div>
                            </div>
                            <div class="col-span-4">
                                <div class="flex gap-1 justify-center">
                                    <div>Requested By:</div>
                                    <div class="font-semibold"> </div>
                                </div>
                            </div>
                            <div class="col-span-4">
                                <div class="flex gap-1 justify-end">
                                    <div>Case No:</div>
                                    <div class="font-semibold">{data?.caseNumber || '--'}</div>
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-12 text-sm">
                            <div class="col-span-2 flex-row text-center">
                                <div class="flex-col border-r-2 border-black pr-2 h-full">
                                    <div class="border-b font-semibold border-black">{age || '--'}</div>
                                    <div class="mb-1">Age</div>
                                    <div class="border-b font-semibold border-black">{data?.patient?.gender || '--'}</div>
                                    <div class="mb-1">Gender</div>
                                    <div class="border-b font-semibold border-black">{formatDateMDY(data?.created) || '--'}</div>
                                    <div class="mb-1">Record Date</div>
                                    <div class="border-b font-semibold border-black">{data?.stat || '--'}</div>
                                    <div class="mb-1">Stat/Routine</div>
                                </div>
                            </div>
                            <div class="col-span-10 text-sm">
                                <div class="grid grid-cols-2 mx-6 gap-4">
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Exam Desired</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.exam || '--'}</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                    </div>
                                    <div class="flex gap-1 justify-center">
                                        <div class="text-center whitespace-nowrap">RESULTS S.I.</div>
                                    </div>
                                    <div class="flex gap-1 justify-center">
                                        <div class="text-center whitespace-nowrap">NORMAL RESULTS S.I.</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Hemoglobin Concentration Mass</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.hemoglobin || '--'}</div>
                                        <div class="w-1/12 text-sm">gms/L</div>
                                    </div>
                                    <div class="flex gap-1 ml-4 justify-between">
                                        <div class="text-right whitespace-nowrap">F: 120-150 gms/L | M: 130-170 gms/L</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Erythrocyte Volume Fraction</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.erythrocyteVolume || '--'}</div>
                                        <div class="w-1/12 text-sm">gms/L</div>
                                    </div>
                                    <div class="flex gap-1 ml-4 justify-between">
                                        <div class="text-right whitespace-nowrap">F: 0.37-0.45 gms/L | M: 0.40-0.50 gms/L</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Erythrocyte Number Concentration</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.erythrocyteNumber || '--'}</div>
                                        <div class="w-1/12 text-sm">X10<sup>12</sup>/L</div>
                                    </div>
                                    <div class="flex gap-1 ml-4 justify-between">
                                        <div class="text-right whitespace-nowrap">F: 4.0-5.0 X10<sup>12</sup>/L | M: 4.5-5.50 X10<sup>12</sup>/L</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Leukocyte Number Concentration</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.leukocyteNumber || '--'}</div>
                                        <div class="w-1/12 text-sm">X10<sup>12</sup>/L</div>
                                    </div>
                                    <div class="flex gap-1 ml-4 justify-between">
                                        <div class="text-right whitespace-nowrap">5.0-10X10<sup>9</sup>/L</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Blood Type</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.bloodType || '--'}</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">RH</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.rh || '--'}</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">LEUKOCYTE TYPE NUMBER FRACTION</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Neutrophil Number Fraction</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.neutrophilNumber || '--'}</div>
                                        <div class="text-right whitespace-nowrap">0.60-0.70</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Bleeding Time (Duke's Method)</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.bleedingTime || '--'}</div>
                                        <div class="text-right whitespace-nowrap">1-5 mins</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Segmenters</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.segmenters || '--'}</div>
                                        <div class="text-right whitespace-nowrap">0.60-0.70</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Clotting Time (Slide Method)</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.clottingTime || '--'}</div>
                                        <div class="text-right whitespace-nowrap">2-6 mins</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Stab</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.stab || '--'}</div>
                                        <div class="text-right whitespace-nowrap">0.02-0.06</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Eosinophil</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.eosinophil || '--'}</div>
                                        <div class="text-right whitespace-nowrap">0.02-0.03</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Basophil</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.basophil || '--'}</div>
                                        <div class="text-right whitespace-nowrap">0.00-0.01</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                    </div>
                                    <div class="flex col-span-2 gap-1 justify-center">
                                        <div class="text-right whitespace-nowrap">Lymphocyte</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.lympocyte || '--'}</div>
                                        <div class="text-right whitespace-nowrap">Adult: 0.18-0.30 | Infant: 0.22-0.40</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Monocyte</div>
                                        <div class="font-semibold border-b border-black text-right">{data?.monocyte || '--'}</div>
                                        <div class="text-right whitespace-nowrap">0.04-0.08</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                        <div class="font-bold text-right whitespace-nowrap">Total</div>
                                        <div class="font-bold border-b border-black text-right">{data?.total || '--'}</div>
                                    </div>
                                    <div class="flex gap-1 justify-end">
                                    </div>
                                    <div class="col-span-2 flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Others</div>
                                        <div class="font-semibold border-b border-black text-left w-full">{data?.others || '--'}</div>
                                    </div>
                                    <div class="col-span-2 flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Thrombocyte Number Fraction</div>
                                        <div class="font-semibold border-b border-black text-left w-full">{data?.thrombocyteNumber || '--'}</div>
                                        <div class="text-right whitespace-nowrap">X10<sup>9</sup>/L 150-350 X10<sup>9</sup>/L</div>
                                    </div>
                                    <div class="col-span-2 flex gap-1 justify-end">
                                        <div class="text-right whitespace-nowrap">Erythrocyte Sedimentation Rate (Westergreen)</div>
                                        <div class="font-semibold border-b border-black text-left w-full">{data?.erythrocyteSedimentation || '--'}</div>
                                        <div class="text-right whitespace-nowrap">mm/hr F: 0-20 mm/hr | M: 0-9 mm/hr</div>
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
    overflow-y: hidden;
  }
}

</style>