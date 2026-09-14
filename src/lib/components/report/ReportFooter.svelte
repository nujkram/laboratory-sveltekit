<script>
	// @ts-nocheck
	// Paper-form footer: the analyzer footnote (thyroid/PSA forms only),
	// "Noted By:" over two signature blocks (name and license above a rule, role
	// title beneath), the clinical-correlation fine print, and the encoder /
	// print-date line.
	import { formatDateMDY } from '$lib/utils/dateHelper.js';
	export let pathologist = null;
	export let medicalTechnologist = null;
	export let createdBy = null;
	/** analyzer credit printed above "Noted By:", e.g. "*Anbio TM" */
	export let footnote = '';
</script>

<div class="report-gap report-no-break mt-6" style="font-size: 9pt">
	{#if footnote}
		<div class="mb-2 italic">{footnote}</div>
	{/if}
	<div>Noted By:</div>
	<div class="mt-4 flex justify-between">
		<div class="text-center" style="width: 2.5in">
			<div class="whitespace-nowrap font-bold" style="font-size: 10pt">
				{pathologist?.profile?.displayName || ''}&#8203;
			</div>
			<div class="border-b border-black pb-0.5">Lic# {pathologist?.license || '________'}</div>
			<div class="pt-0.5">Pathologist</div>
		</div>
		<div class="text-center" style="width: 2.5in">
			<div class="whitespace-nowrap font-bold" style="font-size: 10pt">
				{medicalTechnologist?.profile?.displayName || ''}&#8203;
			</div>
			<div class="border-b border-black pb-0.5">
				Lic# {medicalTechnologist?.license || '________'}
			</div>
			<div class="pt-0.5">Medical Technologist</div>
		</div>
	</div>
	<div class="mt-1 text-center" style="font-size: 8pt">
		***Please correlate clinically. May confirm with other test/method. If necessary.
	</div>
	<div class="mt-1 flex" style="font-size: 8pt">
		<div class="w-1/2">Encoded by: {createdBy?.profile?.displayName || ''}</div>
		<div class="w-1/2 text-right">Date Printed: {formatDateMDY(Date.now())}</div>
	</div>
</div>
