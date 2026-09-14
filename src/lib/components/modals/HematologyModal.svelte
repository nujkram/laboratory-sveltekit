<script>
	// @ts-nocheck
	// Hematology (CBC) report laid out like the paper form: S.I. results block,
	// blood type + Rh, leukocyte differential with the OTHERS (red-cell index)
	// box on the right, then ESR / thrombocyte / bleeding / clotting rows.
	import ReportModal from '$lib/components/report/ReportModal.svelte';
	import ReportHeader from '$lib/components/report/ReportHeader.svelte';
	import ReportPatientBlock from '$lib/components/report/ReportPatientBlock.svelte';
	import ReportFooter from '$lib/components/report/ReportFooter.svelte';
	import ReportFreeText from '$lib/components/report/ReportFreeText.svelte';
	import ReportNote from '$lib/components/report/ReportNote.svelte';
	import {
		hematologyMainRows,
		leukocyteRows,
		cbcIndexRows
	} from '$lib/constants/hematologyRanges.js';
	export let isViewModalOpen = false;
	export let data;
</script>

<ReportModal bind:isViewModalOpen paper="a4Hema">
	<ReportHeader title="Hematology" bannerClass="bg-report-hematology" />
	<ReportPatientBlock
		patient={data?.patient}
		caseNumber={data?.caseNumber}
		created={data?.created}
		requestedBy={data?.requestedBy}
		exam={data?.exam ?? ''}
		thirdRow={{ label: 'Stat/Routine', value: data?.stat }}
	/>

	<div class="report-gap rpt-md mt-2">
		<div class="flex font-bold">
			<div class="underline" style="width: 2.24in">RESULTS S.I.</div>
			<div style="width: 0.94in" />
			<div class="text-center underline" style="width: 3.03in">NORMAL RESULTS S.I.</div>
		</div>
		{#each hematologyMainRows as row}
			<div class="mt-0.5 flex items-end">
				<div class="whitespace-nowrap" style="width: 2.24in">{row.label}</div>
				<div class="border-b border-black text-center font-bold" style="width: 0.94in">
					{data?.[row.field] || ''}&#8203;
				</div>
				<div class="pl-1" style="width: 0.66in">{row.unit}</div>
				<div class="whitespace-nowrap text-left" style="width: 2.37in">
					{#if typeof row.ref === 'object'}
						<span class="font-bold">F:</span>
						{row.ref.f}
						<span class="pl-1 font-bold">M:</span>
						{row.ref.m}
					{:else}
						{row.ref}
					{/if}
				</div>
			</div>
		{/each}

		<div class="mt-1 flex items-end gap-2">
			<div>
				<span class="font-bold">BLOOD TYPE:</span>
				<span class="rpt-tiny block">(Slide Method: Forward Typing Only)</span>
			</div>
			<div class="border-b border-black text-center font-bold" style="width: 0.94in">
				{data?.bloodType ? `"${data.bloodType}"` : ''}&#8203;
			</div>
			<div class="pl-2">RH:</div>
			<div class="border-b border-black text-center font-bold" style="width: 0.9in">
				{data?.rh || ''}&#8203;
			</div>
		</div>

		<div class="mt-1 flex">
			<div style="width: 4.25in">
				<div class="font-bold">LEUKOCYTE TYPE NUMBER FRACTION</div>
				{#each leukocyteRows as row}
					<div class="mt-0.5 flex items-end">
						<div class="whitespace-nowrap" style="width: 1.83in">{row.label}</div>
						<div class="border-b border-black text-center font-bold" style="width: 1.49in">
							{data?.[row.field] || ''}&#8203;
						</div>
						<div class="pl-2" style="width: 1.33in">
							{row.ref}{#if row.ref2}<span class="block">{row.ref2}</span>{/if}
						</div>
					</div>
				{/each}
				<div class="mt-0.5 flex items-end">
					<div class="pr-2 text-right font-bold" style="width: 1.83in">Total:</div>
					<div class="border-b border-black text-center font-bold" style="width: 1.49in">
						{data?.total || ''}&#8203;
					</div>
					<div style="width: 1.33in" />
				</div>
			</div>
			<div class="rpt-sm" style="width: 2.18in">
				<div class="font-bold">OTHERS:</div>
				<div class="rpt-tiny flex">
					<div style="width: 0.62in" />
					<div style="width: 0.56in" />
					<div class="font-bold" style="width: 1in">NORMAL VALUE</div>
				</div>
				{#each cbcIndexRows as row}
					<div class="mt-0.5 flex items-end">
						<div style="width: 0.62in">{row.label}</div>
						<div class="border-b border-black text-center font-bold" style="width: 0.56in">
							{data?.[row.field] || ''}&#8203;
						</div>
						<div class="whitespace-nowrap pl-2" style="width: 1in">{row.ref}</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="mt-1 flex items-end">
			<div class="whitespace-nowrap" style="width: 2.89in">
				Erythrocyte Sedimentation Rate (Westergreen):
			</div>
			<div class="border-b border-black text-center font-bold" style="width: 1.38in">
				{data?.erythrocyteSedimentation || ''}&#8203;
			</div>
			<div class="pl-1" style="width: 0.56in">mm/hr</div>
			<div class="whitespace-nowrap" style="width: 2.06in">
				<span class="font-bold">F:</span> 0 - 20 mm/hr
				<span class="pl-1 font-bold">M:</span> 0 - 9 mm/hr
			</div>
		</div>
		<div class="mt-0.5 flex items-end">
			<div class="whitespace-nowrap" style="width: 2.89in">
				Thrombocyte Number Fraction (SLIDE):
			</div>
			<div class="border-b border-black text-center font-bold" style="width: 1.38in">
				{data?.thrombocyteNumber || ''}&#8203;
			</div>
			<div class="pl-1" style="width: 0.56in">X10⁹/L</div>
			<div style="width: 2.06in">150 - 350 X10⁹/L</div>
		</div>
		<div class="mt-0.5 flex items-end">
			<div class="whitespace-nowrap" style="width: 2.89in">Bleeding Time (Duke's Method):</div>
			<div class="border-b border-black text-center font-bold" style="width: 1.38in">
				{data?.bleedingTime || ''}&#8203;
			</div>
			<div class="whitespace-nowrap pl-1" style="width: 0.56in">mins. sec.</div>
			<div style="width: 2.06in">1 - 5 minutes</div>
		</div>
		<div class="mt-0.5 flex items-end">
			<div class="whitespace-nowrap" style="width: 2.89in">Clotting Time (Slide Method):</div>
			<div class="border-b border-black text-center font-bold" style="width: 1.38in">
				{data?.clottingTime || ''}&#8203;
			</div>
			<div class="whitespace-nowrap pl-1" style="width: 0.56in">mins. sec.</div>
			<div style="width: 2.06in">2 - 6 minutes</div>
		</div>

		{#if data?.others}
			<div class="mt-1">
				<ReportFreeText label="Others:" value={data.others} />
			</div>
		{/if}
	</div>

	{#if data?.remarks}
		<ReportNote text={data.remarks} />
	{/if}

	<ReportFooter
		pathologist={data?.pathologist}
		medicalTechnologist={data?.medicalTechnologist}
		createdBy={data?.createdBy}
	/>
</ReportModal>
