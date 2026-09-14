<script>
	// @ts-nocheck
	// Patient identity block laid out like the paper forms: left column
	// Name / Requested by / Exam Desired, middle Age / Sex, right column
	// Date / Case No. / an optional category-specific third row
	// (Specimen for Misc, Stat/Routine for Chemistry & Hematology).
	//
	// The three columns are fixed at 3.3in / 1.45in / 1.95in — the Word grids
	// on every template land within a few hundredths of that (HEMA 3.30 / 1.55
	// / 1.85, RS 3.31 / 1.37 / 1.95), and on the A4 urinalysis form the block
	// runs slightly past the margin exactly as it does in Word.
	import { calculateAge } from '$lib/utils/ageHelper';
	import { formatDateMDY } from '$lib/utils/dateHelper.js';
	import ReportField from './ReportField.svelte';

	export let patient = null;
	export let caseNumber = '';
	export let created = null;
	export let requestedBy = '';
	/** the Chemistry form says "Requesting Physician" where the others say "Requested by" */
	export let requestedByLabel = 'Requested by';
	/** the forms print "Case No." with no colon; Chemistry alone adds one */
	export let caseLabel = 'Case No.';
	/** exam desired line; pass null to omit the row entirely */
	export let exam = null;
	/** { label, value } third row on the right column, or null */
	export let thirdRow = null;
	/**
	 * The Miscellaneous forms print patient values as plain bold text with no
	 * rule beneath; every other form underlines them.
	 */
	export let underline = true;

	$: age = patient?.birthDate ? calculateAge(patient.birthDate) : '';
</script>

<div class="report-gap rpt-md mt-1 grid" style="grid-template-columns: 3.3in 1.45in 1.95in">
	<div class="flex flex-col gap-0.5">
		<div class="flex gap-1">
			<span class="shrink-0">Name:</span>
			<ReportField value={patient?.completeName} align="left" {underline} />
		</div>
		<div class="flex gap-1">
			<span class="shrink-0">{requestedByLabel}:</span>
			<ReportField value={requestedBy} align="left" {underline} />
		</div>
		{#if exam !== null}
			<div class="flex gap-1">
				<span class="shrink-0">Exam Desired:</span>
				<ReportField value={exam} align="left" {underline} />
			</div>
		{/if}
	</div>
	<div class="flex flex-col gap-0.5">
		<div class="flex gap-1">
			<span class="shrink-0">Age:</span>
			<ReportField value={age} align="left" {underline} />
		</div>
		<div class="flex gap-1">
			<span class="shrink-0">Sex:</span>
			<ReportField value={patient?.gender} align="left" {underline} />
		</div>
	</div>
	<div class="flex flex-col gap-0.5">
		<div class="flex gap-1">
			<span class="shrink-0">Date:</span>
			<ReportField value={created ? formatDateMDY(created) : ''} align="left" {underline} />
		</div>
		<div class="flex gap-1">
			<span class="shrink-0">{caseLabel}</span>
			<ReportField value={caseNumber} align="left" {underline} />
		</div>
		{#if thirdRow}
			<div class="flex gap-1">
				<span class="shrink-0">{thirdRow.label}:</span>
				<ReportField value={thirdRow.value} align="left" {underline} />
			</div>
		{/if}
	</div>
</div>
