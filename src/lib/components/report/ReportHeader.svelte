<script>
	// @ts-nocheck
	// Paper-form header. Two variants, because the templates differ:
	//   compact — Hema/Chem/Urinalysis/Parasitology and the letter-size serology
	//             forms: 8pt, four lines ending in LABORATORY DEPARTMENT.
	//   tall    — the long-bond TSH / T3 T4 / PSA forms: 10pt, street and
	//             telephone on separate lines, and no LABORATORY DEPARTMENT line.
	/** department name shown in the banner, e.g. "HEMATOLOGY" */
	export let title = '';
	/** banner fill, e.g. "bg-report-hematology" */
	export let bannerClass = 'bg-report-misc';
	/** 'compact' | 'tall' */
	export let variant = 'compact';
</script>

<div class="flex items-center justify-center gap-2">
	<img src="/mmg-logo.png" alt="" class="shrink-0" style="width: 0.65in; height: auto;" />
	<div class="rpt-head text-center leading-tight">
		<div class="font-bold uppercase">Medical Mission Group Hospital &amp; Health</div>
		<div>Services Cooperative of Roxas City and Capiz</div>
		{#if variant === 'tall'}
			<div>Washington St., Roxas City</div>
			<div>Tel. No. (036) 6215-798</div>
		{:else}
			<div>Washington St., Roxas City Tel. No. (036) 6215-798</div>
			<div class="font-bold tracking-wide">LABORATORY DEPARTMENT</div>
		{/if}
	</div>
</div>

<div
	class="report-gap rpt-lg mt-2 border border-black py-0.5 text-center font-bold uppercase tracking-wide text-black {bannerClass}"
>
	{title}
</div>
