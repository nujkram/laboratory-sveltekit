<script>
	// @ts-nocheck
	// Hematology (CBC) report laid out like HEMA FORM.docx: S.I. results block,
	// blood type + Rh, the leukocyte differential with the OTHERS (red-cell
	// index) box floated beside it, then ESR / thrombocyte / bleeding / clotting.
	// Every width is the Word table grid in inches; rows use the default
	// flex alignment (stretch) so, as in a Word cell, text sits at the top and
	// the rule sits at the bottom even when a neighbouring cell wraps.
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

	// Bleeding / clotting time print in two ruled cells, "mins." and "sec.".
	// A value with two numbers ("2 mins 30 sec", "2:30") splits across them;
	// anything else goes in the minutes cell as typed.
	function splitTime(v) {
		const m = String(v ?? '').match(/(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/);
		return m ? [m[1], m[2]] : [v ?? '', ''];
	}
	$: bleed = splitTime(data?.bleedingTime);
	$: clot = splitTime(data?.clottingTime);
</script>

<ReportModal bind:isViewModalOpen transaction={data?.transaction} paper="a4Hema">
	<ReportHeader title="Hematology" bannerClass="bg-report-hematology" />
	<ReportPatientBlock
		patient={data?.patient}
		caseNumber={data?.caseNumber}
		created={data?.created}
		requestedBy={data?.requestedBy}
		exam={data?.exam ?? ''}
		thirdRow={{ label: 'STAT/ROUTINE', value: data?.stat }}
	/>

	<div class="report-gap rpt-md mt-2">
		<!-- "RESULTS S.I." carries a 0.5in first-line indent on the form; the
		     normal-values heading sits over its column. Neither is underlined. -->
		<div class="flex font-bold">
			<div style="width: 3.99in; padding-left: 0.5in">RESULTS S.I.</div>
			<div>NORMAL RESULTS S.I.</div>
		</div>

		<!-- main table: indented 0.15in, grid 2.24 / 0.94 / 0.66 / 2.37 -->
		<div style="margin-left: 0.15in">
			{#each hematologyMainRows as row}
				<div class="mt-0.5 flex">
					<div class="whitespace-nowrap" style="width: 2.24in">{row.label}</div>
					<div class="border-b border-black text-center font-bold" style="width: 0.94in">
						{data?.[row.field] || ''}&#8203;
					</div>
					<div class="pl-1" style="width: 0.66in">{row.unit}</div>
					<div class="whitespace-nowrap" style="width: 2.37in">
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

		<!-- BLOOD TYPE is a paragraph indented 1in; RH is a small table floated
		     at 2.52in from the margin with "RH:" 0.57in into it. Neither value
		     is ruled on the paper, and both print exactly as typed. -->
		<div class="mt-1 flex" style="margin-left: 1in">
			<div style="width: 1.52in">
				<div class="font-bold">BLOOD TYPE: {data?.bloodType || ''}</div>
				<div class="font-bold" style="font-size: 5pt">
					(<span class="font-normal">Slide Method: Forward Typing Only</span>)
				</div>
			</div>
			<div class="rpt-sm font-bold" style="padding-left: 0.57in">RH: {data?.rh || ''}</div>
		</div>

		<!-- Differential (4.65in) with the OTHERS index box floated beside it at
		     4.76in from the margin; the box runs 0.17in into the right margin,
		     exactly as it does on the Word form. -->
		<div class="mt-1 flex">
			<div class="shrink-0" style="width: 4.65in">
				<div class="rpt-sm font-bold">LEUKOCYTE TYPE NUMBER FRACTION</div>
				{#each leukocyteRows as row}
					<div class="mt-0.5 flex">
						<div
							class="whitespace-nowrap"
							style="width: {row.labelWidth}; padding-left: {row.indent ?? '0'}"
						>
							{row.label}
						</div>
						<div
							class="border-b border-black text-center font-bold"
							style="width: {row.valueWidth}"
						>
							{data?.[row.field] || ''}&#8203;
						</div>
						<div class="pl-2" style="width: 1.33in">
							{row.ref}{#if row.ref2}<span class="block">{row.ref2}</span>{/if}
						</div>
					</div>
				{/each}
				<div class="mt-0.5 flex">
					<div class="text-right font-bold" style="width: 1.5in">Total:</div>
					<div class="border-b border-black pr-1 text-right font-bold" style="width: 1.82in">
						{data?.total || ''}&#8203;
					</div>
					<div style="width: 1.33in" />
				</div>
			</div>

			<!-- OTHERS box: 9pt, grid 0.62 / 0.56 / 1.00; index values are not bold on the form -->
			<div class="rpt-sm shrink-0" style="width: 2.18in; margin-left: 0.11in">
				<div class="font-bold">OTHERS:</div>
				<div class="flex">
					<div style="width: 1.18in" />
					<div class="text-center font-bold" style="width: 1in">NORMAL VALUE</div>
				</div>
				{#each cbcIndexRows as row}
					<div class="mt-0.5 flex">
						<div style="width: 0.62in">{row.label}</div>
						<div class="border-b border-black text-center" style="width: 0.56in">
							{data?.[row.field] || ''}&#8203;
						</div>
						<div class="whitespace-nowrap text-center" style="width: 1in">{row.ref}</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- ESR / thrombocyte / bleeding / clotting: grid 2.43 / 0.46 / 0.47 / 0.91 / 0.56 / 2.06.
		     The ESR label is wider than its 2.89in cell and wraps, as it does in Word. -->
		<div class="mt-1 flex">
			<div style="width: 2.89in">Erythrocyte Sedimentation Rate (Westergreen):</div>
			<div class="border-b border-black text-center font-bold" style="width: 1.38in">
				{data?.erythrocyteSedimentation || ''}&#8203;
			</div>
			<div class="pl-1" style="width: 0.56in">mm/hr</div>
			<div class="whitespace-nowrap" style="width: 2.06in">
				<span class="font-bold">F:</span> 0 - 20 mm/hr
				<span class="pl-1 font-bold">M:</span> 0 - 9 mm/hr
			</div>
		</div>
		<div class="mt-0.5 flex">
			<div class="whitespace-nowrap" style="width: 2.89in">
				Thrombocyte Number Fraction (SLIDE):
			</div>
			<div class="border-b border-black text-center font-bold" style="width: 1.38in">
				{data?.thrombocyteNumber || ''}&#8203;
			</div>
			<div class="pl-1" style="width: 0.56in">X10⁹/L</div>
			<div style="width: 2.06in">150 - 350 X10⁹/L</div>
		</div>
		<div class="mt-0.5 flex">
			<div class="whitespace-nowrap" style="width: 2.43in">Bleeding Time (Duke's Method):</div>
			<div class="border-b border-black text-center" style="width: 0.93in">
				<span class="font-bold">{bleed[0]}</span>&#8203; mins.
			</div>
			<div class="border-b border-black text-right" style="width: 0.91in">
				<span class="font-bold">{bleed[1]}</span>&#8203; sec.
			</div>
			<div class="pl-2" style="width: 2.62in">1 - 5 minutes</div>
		</div>
		<div class="mt-0.5 flex">
			<div class="whitespace-nowrap" style="width: 2.43in">Clotting Time (Slide Method):</div>
			<div class="border-b border-black text-center" style="width: 0.93in">
				<span class="font-bold">{clot[0]}</span>&#8203; mins.
			</div>
			<div class="border-b border-black text-right" style="width: 0.91in">
				<span class="font-bold">{clot[1]}</span>&#8203; sec.
			</div>
			<div class="pl-2" style="width: 2.62in">2 - 6 minutes</div>
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
