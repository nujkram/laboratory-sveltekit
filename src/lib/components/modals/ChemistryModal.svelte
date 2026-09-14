<script>
	// @ts-nocheck
	// Chemistry report laid out like the paper form: one row per analyte with
	// RESULTS and REFERENCE VALUE columns. Every analyte always renders (blank
	// underline when empty) so values sit in the same place on every printout.
	import ReportModal from '$lib/components/report/ReportModal.svelte';
	import ReportHeader from '$lib/components/report/ReportHeader.svelte';
	import ReportPatientBlock from '$lib/components/report/ReportPatientBlock.svelte';
	import ReportFooter from '$lib/components/report/ReportFooter.svelte';
	import { chemistryRanges } from '$lib/constants/chemistryRanges.js';
	export let isViewModalOpen = false;
	export let data;
</script>

<ReportModal bind:isViewModalOpen paper="chemLand">
	<ReportHeader title="Chemistry" bannerClass="bg-report-chemistry" />
	<ReportPatientBlock
		patient={data?.patient}
		caseNumber={data?.caseNumber}
		created={data?.created}
		requestedBy={data?.requestedBy}
		requestedByLabel="Requesting Physician"
		exam={null}
		thirdRow={{ label: 'Stat/Routine', value: data?.stat }}
	/>

	<div class="report-gap rpt-md mt-2" style="width: 5.52in">
		<div class="flex font-bold">
			<div style="width: 1.89in" />
			<div class="text-center" style="width: 1.19in">RESULTS</div>
			<div class="text-center" style="width: 2.44in">REFERENCE VALUE</div>
		</div>
		{#each chemistryRanges as row}
			<div class="mt-0.5 flex items-end">
				<div class="whitespace-nowrap" style="width: 1.89in">{row.label}</div>
				<div class="border-b border-black text-center font-bold" style="width: 1.19in">
					{data?.[row.field] || ''}&#8203;
				</div>
				<div class="text-center" style="width: 2.44in">
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
	</div>

	<ReportFooter
		pathologist={data?.pathologist}
		medicalTechnologist={data?.medicalTechnologist}
		createdBy={data?.createdBy}
	/>
</ReportModal>
