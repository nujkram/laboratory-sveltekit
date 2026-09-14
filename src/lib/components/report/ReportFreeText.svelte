<script>
	// @ts-nocheck
	// Multi-line free text over ruled lines, the way the paper forms leave space
	// for handwritten findings. Deliberately NOT ReportField — that atom is a
	// single-line underline and would collapse encoded line breaks onto one row.
	export let label = '';
	export let value = '';
	/** minimum number of ruled lines to draw, matching the printed form */
	export let lines = 1;

	$: filled = String(value ?? '').split('\n');
	$: rows = filled.length >= lines ? filled : filled.concat(Array(lines - filled.length).fill(''));
</script>

<div class="flex gap-1">
	{#if label}<span class="shrink-0">{label}</span>{/if}
	<div class="flex-1">
		{#each rows as line}
			<div class="border-b border-black font-bold">{line}&#8203;</div>
		{/each}
	</div>
</div>
