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
	//
	// DOB is the one field here that no Word template asks for: it was added
	// beneath Age / Sex on request. It prints abbreviated and numeric —
	// "DOB: 01/15/1984" rather than the spelled month used by "Date:" — because
	// at the 12pt long-bond base size (TSH / T3 T4 / PSA) the spelled form wraps
	// out of the 1.45in middle column.
	import { calculateAge } from '$lib/utils/ageHelper';
	import { formatDateMDY, formatDateNumericMDY } from '$lib/utils/dateHelper.js';
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
	/**
	 * RS FORM (Parasitology) carries neither an Exam Desired line nor a third
	 * right-column row, so the added DOB would leave it three lines tall with a
	 * lone row at the bottom. `packed` instead lays its seven fields four-and-
	 * three across two lines, keeping the block two lines tall as on the form.
	 * It ignores `exam` and `thirdRow`, which that form does not use.
	 */
	export let packed = false;

	// age as of the record's own date, so a reprint never drifts with time
	$: age = patient?.birthDate ? calculateAge(patient.birthDate, created) : '';
	$: dob = formatDateNumericMDY(patient?.birthDate);
</script>

{#if packed}
	<!-- Four fields on the first line, three on the second, so the RS FORM block
	     stays two lines tall with DOB added. The two lines size their own fields
	     rather than sharing a column grid: a shared 4-column grid would cut Name
	     to ~25 characters and Requested by to ~19, where sizing per line keeps
	     them at ~32 and ~31 against the 3-column block's 34 and 28. Both lines
	     still end flush at the 6.5in printable width of the letter sheet. -->
	<div class="report-gap rpt-md mt-1 flex flex-col gap-0.5">
		<div class="flex gap-2">
			<div class="flex flex-1 gap-1">
				<span class="shrink-0">Name:</span>
				<ReportField value={patient?.completeName} align="left" {underline} />
			</div>
			<div class="flex gap-1" style="width: 0.8in">
				<span class="shrink-0">Age:</span>
				<ReportField value={age} align="left" {underline} />
			</div>
			<div class="flex gap-1" style="width: 1in">
				<span class="shrink-0">Sex:</span>
				<ReportField value={patient?.gender} align="left" {underline} />
			</div>
			<div class="flex gap-1" style="width: 1.3in">
				<span class="shrink-0">Date:</span>
				<ReportField value={created ? formatDateMDY(created) : ''} align="left" {underline} />
			</div>
		</div>
		<div class="flex gap-2">
			<div class="flex flex-1 gap-1">
				<span class="shrink-0">{requestedByLabel}:</span>
				<ReportField value={requestedBy} align="left" {underline} />
			</div>
			{#if dob}
				<div class="flex gap-1" style="width: 1.3in">
					<span class="shrink-0">DOB:</span>
					<ReportField value={dob} align="left" {underline} />
				</div>
			{:else}
				<div style="width: 1.3in" />
			{/if}
			<div class="flex gap-1" style="width: 1.5in">
				<span class="shrink-0">{caseLabel}</span>
				<ReportField value={caseNumber} align="left" {underline} />
			</div>
		</div>
	</div>
{:else}
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
			{#if dob}
				<div class="flex gap-1">
					<span class="shrink-0">DOB:</span>
					<ReportField value={dob} align="left" {underline} />
				</div>
			{/if}
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
{/if}
