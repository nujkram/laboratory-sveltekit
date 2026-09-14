<script>
	// @ts-nocheck
	// The paper form's "value written on a blank line" atom. Empty values
	// still draw the underline (the forms never omit a blank), so a
	// zero-width filler keeps the rule at full width.
	export let value = '';
	/** width utility for the underlined span, default fills the row */
	export let width = 'flex-1';
	export let align = 'center';
	/** unit printed after the underline, e.g. "/hpf", "mmol/L" */
	export let unit = '';
	/** the Miscellaneous forms print their patient values without a rule */
	export let underline = true;
	const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };
</script>

<span
	class="font-bold uppercase {underline ? 'border-b border-black' : ''} {width} {alignClass[
		align
	] ?? 'text-center'}">{value || ''}&#8203;</span
>{#if unit}<span class="shrink-0 pl-1">{unit}</span>{/if}
