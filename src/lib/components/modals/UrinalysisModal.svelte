<script>
	// @ts-nocheck
	// Urinalysis report laid out like the paper form: left column with the
	// physical/chemical exam then CASTS (per /lpf) and cell counts (per /hpf),
	// right column with CRYSTALS and microscopic findings.
	import ReportModal from '$lib/components/report/ReportModal.svelte';
	import ReportHeader from '$lib/components/report/ReportHeader.svelte';
	import ReportPatientBlock from '$lib/components/report/ReportPatientBlock.svelte';
	import ReportFooter from '$lib/components/report/ReportFooter.svelte';
	import ReportField from '$lib/components/report/ReportField.svelte';
	export let isViewModalOpen = false;
	export let data;

	const physical = [
		['Color:', 'color'],
		['Transparency:', 'transparency'],
		['Reaction:', 'reaction'],
		['Specific Gravity:', 'specificGravity'],
		['Protein:', 'protein'],
		['Sugar:', 'sugar']
	];
	const casts = [
		['Fine Granular Cast:', 'fineGran'],
		['Coarse Granular Cast:', 'coarseGran'],
		['Pus Cell Cast:', 'pusCellCast'],
		['Hyaline Cast:', 'hyaline']
	];
	const crystals = [
		['Uric Acid:', 'uricAcid'],
		['Calcium Oxalate:', 'calciumOxolate'],
		['Amorphous urates:', 'amorphous'],
		['Triple phosphates:', 'tripPhosphates'],
		['Squamous Epithelial cells:', 'squamous'],
		['Bacteria:', 'bacteria'],
		['Mucous threads:', 'mucous'],
		['Round Epithelial cells:', 'roundEpithelial'],
		['Yeast cells:', 'yeastCell'],
		['Trichomonas vaginalis:', 'vaginalis'],
		['Trichomonas hominis:', 'hominis']
	];
</script>

<ReportModal bind:isViewModalOpen paper="a4">
	<ReportHeader title="Urinalysis" bannerClass="bg-report-urinalysis" />
	<ReportPatientBlock
		patient={data?.patient}
		caseNumber={data?.caseNumber}
		created={data?.created}
		requestedBy={data?.requestedBy}
		exam={data?.exam ?? ''}
	/>

	<div class="report-gap rpt-md mt-2 grid grid-cols-2 gap-x-8">
		<div class="flex flex-col gap-0.5">
			{#each physical as [label, field]}
				<div class="flex gap-1">
					<span class="shrink-0 whitespace-nowrap" style="width: 1.2in">{label}</span>
					<ReportField value={data?.[field]} />
				</div>
			{/each}

			<div class="mt-1 font-bold">CASTS:</div>
			{#each casts as [label, field]}
				<div class="flex gap-1">
					<span class="shrink-0 whitespace-nowrap" style="width: 1.51in">{label}</span>
					<ReportField value={data?.[field]} unit="/lpf" />
				</div>
			{/each}

			<div class="mt-1 flex gap-1">
				<span class="shrink-0 whitespace-nowrap" style="width: 0.76in">RBC:</span>
				<ReportField value={data?.rbc} unit="/hpf" />
			</div>
			<div class="flex gap-1">
				<span class="shrink-0 whitespace-nowrap" style="width: 0.76in">PUS Cells:</span>
				<ReportField value={data?.pusCell} unit="/hpf" />
			</div>
		</div>

		<div class="flex flex-col gap-0.5">
			<div class="font-bold">CRYSTALS:</div>
			{#each crystals as [label, field]}
				<div class="flex gap-1">
					<span class="shrink-0 whitespace-nowrap" style="width: 1.88in">{label}</span>
					<ReportField value={data?.[field]} />
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
