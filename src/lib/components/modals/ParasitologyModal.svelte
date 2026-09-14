<script>
	// @ts-nocheck
	// Parasitology report, in the order the paper form (RS FORM.docx) prints it:
	// COLOR / CONSISTENCY with the values set large, then the "Others:" block
	// over the microscopic cell counts, then the RESULTS line and the ruled
	// lines beneath it. The paper form doesn't itemize species, so positive
	// species findings are summarized on the RESULTS line; a negative summary
	// (e.g. "NO INTESTINAL PARASITE SEEN") arrives via the remarks field.
	import ReportModal from '$lib/components/report/ReportModal.svelte';
	import ReportHeader from '$lib/components/report/ReportHeader.svelte';
	import ReportPatientBlock from '$lib/components/report/ReportPatientBlock.svelte';
	import ReportFooter from '$lib/components/report/ReportFooter.svelte';
	import ReportField from '$lib/components/report/ReportField.svelte';
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
	<ReportHeader title="Parasitology" bannerClass="bg-report-parasitology" />
	<ReportPatientBlock
		patient={data?.patient}
		caseNumber={data?.caseNumber}
		created={data?.created}
		requestedBy={data?.requestedBy}
	/>

	<div class="report-gap rpt-md mt-3 grid grid-cols-2 gap-x-10">
		<div class="flex items-end gap-1">
			<span class="shrink-0 uppercase">Color:</span>
			<span class="rpt-2xl flex-1 border-b border-black text-center font-bold uppercase"
				>{data?.color || ''}&#8203;</span
			>
		</div>
		<div class="flex items-end gap-1">
			<span class="shrink-0 uppercase">Consistency:</span>
			<span class="rpt-2xl flex-1 border-b border-black text-center font-bold uppercase"
				>{data?.consistency || ''}&#8203;</span
			>
		</div>
	</div>

	<div class="report-gap rpt-md mt-4 w-1/2">
		<div class="rpt-xl font-bold">Others:</div>
		<div class="mt-1 flex flex-col gap-0.5">
			{#each cells as [label, field, unit]}
				<div class="flex gap-1">
					<span class="w-5/12 shrink-0">{label}</span>
					<ReportField value={data?.[field]} {unit} />
				</div>
			{/each}
		</div>
	</div>

	<div class="report-gap rpt-md mt-4 flex gap-2">
		<span class="shrink-0 uppercase">Results:</span>
		<span class="font-bold uppercase">{resultLine}&#8203;</span>
	</div>

	<div class="report-gap rpt-md mt-2 w-2/3">
		<ReportFreeText value={data?.others} lines={3} />
	</div>

	<ReportFooter
		pathologist={data?.pathologist}
		medicalTechnologist={data?.medicalTechnologist}
		createdBy={data?.createdBy}
	/>
</ReportModal>
