<script>
	// @ts-nocheck
	// Miscellaneous report. The paper forms are not one layout but fifteen, so
	// the exam's entry in $lib/constants/miscExams.js drives everything: paper
	// size, banner fill, header variant, title, kit brand, reference values and
	// result rows. Two families —
	//   rapid: qualitative kit result(s) under a centred title
	//   panel: NORMAL RANGE over ANALYSIS / RESULT (TSH alone, or TSH grouped
	//          with FT3/FT4/T3/T4, or PSA) on long bond
	import ReportModal from '$lib/components/report/ReportModal.svelte';
	import ReportHeader from '$lib/components/report/ReportHeader.svelte';
	import ReportPatientBlock from '$lib/components/report/ReportPatientBlock.svelte';
	import ReportFooter from '$lib/components/report/ReportFooter.svelte';
	import ReportNote from '$lib/components/report/ReportNote.svelte';
	import { getMiscExam } from '$lib/constants/miscExams.js';
	export let isViewModalOpen = false;
	export let data;

	$: cfg = getMiscExam(data?.exam);
	$: analyzerNote = cfg.analyzer && data?.analyzer ? `*${data.analyzer} TM` : '';
</script>

<ReportModal bind:isViewModalOpen paper={cfg.paper}>
	<ReportHeader title="Miscellaneous" bannerClass={cfg.banner} variant={cfg.header} />
	<ReportPatientBlock
		patient={data?.patient}
		caseNumber={data?.caseNumber}
		created={data?.created}
		requestedBy={data?.requestedBy}
		exam={data?.exam ?? ''}
		thirdRow={{ label: 'Specimen', value: data?.specimen }}
		underline={false}
	/>

	{#if cfg.kind === 'panel'}
		<div class="report-gap mt-5 w-2/3">
			<div class="text-center">NORMAL RANGE</div>
			{#each cfg.panel as row}
				<div class="flex">
					<div class="w-4/12 font-bold">{row.rangeLabel ?? row.label}</div>
					<div class="w-8/12 font-bold">{row.range}</div>
				</div>
			{/each}
		</div>

		<div class="report-gap mt-5 w-2/3">
			<div class="flex">
				<div class="w-4/12 text-center">ANALYSIS</div>
				<div class="w-8/12 pl-6 font-bold">RESULT</div>
			</div>
			{#each cfg.panel as row}
				<div class="mt-1 flex items-end">
					<div class="w-4/12 font-bold">{row.label}</div>
					<div class="w-4/12 border-b border-black text-center font-bold">
						{data?.[row.field] || ''}&#8203;
					</div>
					<div class="w-4/12 pl-2 font-bold">{row.unit}</div>
				</div>
			{/each}
		</div>
	{:else}
		{#if cfg.title || data?.exam}
			<div class="report-gap mt-5 text-center">
				<div class="font-bold uppercase">{cfg.title || data?.exam}</div>
				{#if cfg.method}<div class="rpt-sm">{cfg.method}</div>{/if}
				{#if cfg.nv}<div class="rpt-sm">
						<span class="font-bold">NV:</span>
						{cfg.nv.replace(/^NV:\s*/, '')}
					</div>{/if}
			</div>
		{/if}

		<div class="report-gap mt-5 flex flex-col items-center gap-1">
			{#each cfg.rows as row}
				<div class="flex w-2/3 items-end gap-3">
					<span class="w-2/12 shrink-0 font-bold">{row.label ?? ''}</span>
					<span class="flex-1 border-b border-black text-center font-bold uppercase"
						>{data?.[row.field] || ''}&#8203;</span
					>
				</div>
			{/each}
		</div>
	{/if}

	{#if cfg.screeningNote}
		<ReportNote text={cfg.screeningNote} />
	{/if}

	{#if data?.remarks}
		<ReportNote text={data.remarks} />
	{/if}

	{#if data?.others}
		<div class="report-gap rpt-xs mt-2 whitespace-pre-line text-center">{data.others}</div>
	{/if}

	<ReportFooter
		pathologist={data?.pathologist}
		medicalTechnologist={data?.medicalTechnologist}
		createdBy={data?.createdBy}
		footnote={analyzerNote}
	/>
</ReportModal>
