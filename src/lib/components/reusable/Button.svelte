<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';

	export let type = 'button';
	export let text = 'Button';
	export let href = '/';
	export let color = '';
	export let rounded = 'rounded-lg';
	export let textColor = 'text-white';
	export let padding = 'py-2 px-4';
	export let textSize = 'text-sm';
	export let classes = '';
	export let margin = '';

	const dispatch = createEventDispatcher();

	const palette = {
		secondary: 'bg-secondary hover:bg-secondaryHover',
		terciary: 'bg-terciary hover:bg-terciaryHover',
		success: 'bg-success hover:bg-successHover',
		danger: 'bg-danger hover:bg-dangerHover',
		warning: 'bg-warning hover:bg-warningHover',
		primary: 'bg-primary hover:bg-primaryHover'
	};
	$: colorClasses = palette[color] || palette.primary;

	const base =
		'inline-flex items-center justify-center gap-1.5 font-medium no-underline shadow-card transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf';

	function click(event) {
		dispatch('click', event.detail);
	}
</script>

{#if type === 'button'}
	<button
		type="submit"
		class="{base} {colorClasses} {textColor} {textSize} {padding} {rounded} {margin} {classes}"
		on:click={click}
	>
		<slot />
		{text}
	</button>
{:else}
	<a
		{href}
		class="{base} {colorClasses} {textColor} {textSize} {padding} {rounded} {margin} {classes}"
	>
		<slot />
		{text}
	</a>
{/if}
