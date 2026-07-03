<script>
	// @ts-nocheck
	// Vector interpretation of the company mark: a ring enclosing three pine-peak
	// silhouettes over a baseline, with the founding year. Drawn in currentColor so
	// the parent controls the tone (leaf on dark, pine on light). Swap in
	// /static logo art here later if a pixel-exact raster is preferred.
	export let size = 44;
	/** show the "1997" year band inside the mark */
	export let year = true;
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 100 100"
	fill="none"
	role="img"
	aria-label="Company logo, established 1997"
	xmlns="http://www.w3.org/2000/svg"
>
	<circle cx="50" cy="50" r="44" stroke="currentColor" stroke-width="5" />
	<path
		d="M18 63 L30 33 L42 63 L50 29 L58 63 L70 33 L82 63"
		stroke="currentColor"
		stroke-width="5"
		stroke-linejoin="round"
		stroke-linecap="round"
	/>
	<path d="M20 71 H80" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" />
	{#if year}
		<text
			x="50"
			y="86"
			text-anchor="middle"
			fill="currentColor"
			font-family="'IBM Plex Mono', monospace"
			font-size="15"
			font-weight="600"
			letter-spacing="1">1997</text
		>
	{/if}
</svg>
