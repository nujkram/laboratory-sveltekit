<script>
	// @ts-nocheck
	// Parasitology report laid out like RS FORM.docx: COLOR / CONSISTENCY with
	// the values set large, then two columns — RESULTS and its ruled lines on
	// the left, the "Others:" cell-count table floated on the right. The paper
	// form doesn't itemize species, so positive species findings are summarized
	// on the RESULTS line; a negative summary (e.g. "NO INTESTINAL PARASITE
	// SEEN") arrives via the remarks field. Widths are the Word grids in inches.
	import ReportModal from '$lib/components/report/ReportModal.svelte';
	import ReportHeader from '$lib/components/report/ReportHeader.svelte';
	import ReportPatientBlock from '$lib/components/report/ReportPatientBlock.svelte';
	import ReportFooter from '$lib/components/report/ReportFooter.svelte';
	import ReportFreeText from '$lib/components/report/ReportFreeText.svelte';
	export let isViewModalOpen = false;
	export let data;

	const speciesFields = [
		['Ascaris Lumbricoides', 'ascarisLumb'],
		['Hookworm', 'hookworm'],
		['Trichuris Trichiura', 'trichuris'],
		['Strongyloides Stercoralis', 'strongyloides'],
		['Entamoeba Coli Cyst', 'entamoebaColiCyst'],
		['Entamoeba Coli Trophozoite', 'entamoebaColiTroph'],
		['Entamoeba Histolytica Cyst', 'entamoebaHistCyst'],
		['Entamoeba Histolytica Trophozoite', 'entamoebaHistTroph']
	];
	// The form's fifth row is an unlabelled blank; it carries Bacteria only
	// when something was actually recorded there.
	const cells = [
		['Pus cells:', 'pusCell', '/hpf'],
		['RBC:', 'rbc', '/hpf'],
		['Yeast cells:', 'yeastCell', ''],
		['Fat globules:', 'fatGlobules', ''],
		['Bacteria:', 'bacteria', '']
	];

	const isNegative = (v) =>
		/^(negative|none|not seen|no .*seen|n\/a|0)$/i.test(String(v ?? '').trim());
	$: findings = speciesFields
		.filter(([, f]) => data?.[f] && !isNegative(data[f]))
		.map(([label, f]) => `${label} — ${data[f]}`);
	$: resultLine = findings.length ? findings.join('; ') : data?.remarks || '';
</script>

<ReportModal bind:isViewModalOpen paper="letter">
	<ReportHeader title="Parasitology" bannerClass="bg-report-parasitology" headSize="9pt" />
	<ReportPatientBlock
		patient={data?.patient}
		caseNumber={data?.caseNumber}
		created={data?.created}
		requestedBy={data?.requestedBy}
		packed
	/>

	<!-- COLOR / CONSISTENCY: grid 0.72 / 2.23 / 0.98 / 1.67, values 16pt bold -->
	<div class="report-gap rpt-md mt-3 flex">
		<div style="width: 0.72in">COLOR:</div>
		<div
			class="rpt-2xl border-b border-black text-center font-bold uppercase"
			style="width: 2.23in"
		>
			{data?.color || ''}&#8203;
		</div>
		<div style="width: 0.98in">CONSISTENCY:</div>
		<div
			class="rpt-2xl border-b border-black text-center font-bold uppercase"
			style="width: 1.67in"
		>
			{data?.consistency || ''}&#8203;
		</div>
	</div>

	<!-- RESULTS runs the full width at 16pt. The Others table is anchored 0.21in
	     below the top of that paragraph on the form — i.e. just under the
	     headline — so it starts here, floated at 3.71in from the margin and
	     3.25in wide (it runs 0.46in into the right margin exactly as in Word),
	     with the three ruled lines (indented 0.57in, 2.44in wide) beside it. -->
	<div class="report-gap rpt-md mt-5 flex items-baseline gap-2">
		<span class="font-bold">RESULTS:</span>
		<span class="rpt-2xl font-bold uppercase underline">{resultLine}&#8203;</span>
	</div>
	<div class="report-gap rpt-md flex items-start">
		<div class="shrink-0" style="width: 3.71in">
			<div class="mt-3" style="margin-left: 0.57in; width: 2.44in">
				<ReportFreeText value={data?.others} lines={3} />
			</div>
		</div>
		<div class="shrink-0" style="width: 3.25in">
			<div class="rpt-xl font-bold">Others:</div>
			{#each cells as [label, field, unit]}
				<div class="flex">
					<div style="width: 1.57in">
						{field === 'bacteria' && !data?.bacteria ? '' : label}
					</div>
					<div class="border-b border-black text-center font-bold uppercase" style="width: 1.06in">
						{data?.[field] || ''}&#8203;
					</div>
					<div class="pl-1" style="width: 0.62in">{unit}</div>
				</div>
			{/each}
		</div>
	</div>

	<ReportFooter
		pathologist={data?.pathologist}
		medicalTechnologist={data?.medicalTechnologist}
		createdBy={data?.createdBy}
	/>
</ReportModal>
