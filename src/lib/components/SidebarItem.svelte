<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	export let title;
	export let link;

	// "/" matches only the dashboard; every other item matches its section prefix.
	$: active = link === '/' ? $page.url.pathname === '/' : $page.url.pathname.startsWith(link);
</script>

<li>
	<a
		href={link}
		aria-current={active ? 'page' : undefined}
		class="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.9rem] font-medium no-underline transition-colors duration-150
			{active
			? 'bg-white/10 text-white'
			: 'text-white/65 hover:bg-white/5 hover:text-white'}"
	>
		<!-- active marker: a leaf tick echoing the logo peaks -->
		<span
			class="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-leaf transition-opacity duration-150
				{active ? 'opacity-100' : 'opacity-0'}"
			aria-hidden="true"
		/>
		<span class="{active ? 'text-leaf-active' : 'text-white/60 group-hover:text-white'}">
			<slot />
		</span>
		{title}
	</a>
</li>
