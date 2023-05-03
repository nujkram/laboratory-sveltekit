<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';

	export let type = 'button';
	export let text = 'Button';
	export let href = '/';
	export let color = '';
	export let rounded = 'rounded-full';
	export let textColor = 'text-white';
	export let padding = 'py-2 px-5';
	export let textSize = 'text-xs';
	export let classes = 'text-center';
	export let margin = 'm-auto';

	const dispatch = createEventDispatcher();

	let active = false;
	let bgColor = '';
	let hoverColor = '';
	let activeColor = '';
	let defaultColor = bgColor;

	switch (color) {
		case 'secondary':
			defaultColor = 'bg-secondary';
			bgColor = 'bg-secondary';
			hoverColor = 'bg-secondaryHover';
			activeColor = 'bg-secondaryActive';
			break;
		case 'terciary':
			defaultColor = 'bg-terciary';
			bgColor = 'bg-terciary';
			hoverColor = 'bg-terciaryHover';
			activeColor = 'bg-terciaryActive';
			break;
		case 'success':
			defaultColor = 'bg-success';
			bgColor = 'bg-success';
			hoverColor = 'bg-successHover';
			activeColor = 'bg-successActive';
			break;
		case 'danger':
			defaultColor = 'bg-danger';
			bgColor = 'bg-danger';
			hoverColor = 'bg-dangerHover';
			activeColor = 'bg-dangerActive';
			break;
		case 'warning':
			defaultColor = 'bg-warning';
			bgColor = 'bg-warning';
			hoverColor = 'bg-warningHover';
			activeColor = 'bg-warningActive';
			break;
		default:
			defaultColor = 'bg-primary';
			bgColor = 'bg-primary';
			hoverColor = 'bg-primaryHover';
			activeColor = 'bg-primaryActive';
			break;
	}
	
	function click(event) {
		dispatch('click', event.detail);
	}
</script>
{#if type === 'button'}
<button
	type='submit'
	class="{bgColor} {textColor} {textSize}  {padding} {rounded} {margin} {classes}"
	on:mouseenter={() => {
		active = true;
		active ? (bgColor = hoverColor) : (bgColor = defaultColor);
	  }}
	  on:mouseleave={() => {
		active = true;
		active ? (bgColor = defaultColor) : (bgColor = hoverColor);
	  }}
	on:click={click}
>
<span class="flex gap-1">

	<slot /> {text} 
</span>
</button>
{:else}
<a
    {href}
    class="{bgColor} {textColor} {textSize}  {padding} {rounded} {margin} {classes}"
    on:mouseenter={() => {
      active = true;
      active ? (bgColor = hoverColor) : (bgColor = defaultColor);
    }}
    on:mouseleave={() => {
      active = true;
      active ? (bgColor = defaultColor) : (bgColor = hoverColor);
    }}
    on:click={() => {
      activeColor = activeColor;
    }}
  >
    {text}
  </a>
{/if}

