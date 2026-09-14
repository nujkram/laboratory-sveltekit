<script>
	// @ts-nocheck
	// The bordered note box from the paper forms — used for the HBsAg / RPR
	// screening notice and for the technologist's free-text note. `pre-line`
	// keeps the line breaks the encoder actually typed.
	export let label = 'Note:';
	export let text = '';
</script>

<div
	class="report-gap rpt-xs mx-auto mt-3 w-11/12 whitespace-pre-line border border-black px-2 py-1"
>
	{#if label}<span class="font-bold">{label}</span> {/if}{text}
</div>
