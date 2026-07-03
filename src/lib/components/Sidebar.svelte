<script>
	// @ts-nocheck
	import Logo from './Logo.svelte';
	import SidebarItem from './SidebarItem.svelte';
	import Dashboard from './icons/Dashboard.svelte';
	import Users from './icons/Users.svelte';
</script>

<aside
	id="logo-sidebar"
	class="fixed top-0 left-0 z-40 flex h-screen w-64 -translate-x-full flex-col bg-pine-fade text-white transition-transform sm:translate-x-0"
	aria-label="Main navigation"
>
	<!-- Brand lockup -->
	<a
		href="/"
		class="flex items-center gap-3 px-5 pt-5 pb-4 no-underline"
		style="text-decoration-line: none;"
	>
		<span class="text-leaf-active">
			<Logo size={46} />
		</span>
		<span class="flex flex-col leading-none">
			<span class="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-leaf-active"
				>Est. 1997</span
			>
			<span class="mt-1 font-display text-lg font-bold leading-tight text-white">Laboratory</span>
			<span class="text-xs font-medium tracking-wide text-white/55">Information System</span>
		</span>
	</a>

	<!-- Signature: a row of pine peaks echoing the logo -->
	<div class="peak-edge mx-5 h-[11px] opacity-70" aria-hidden="true" />

	<nav class="mt-4 flex-1 overflow-y-auto px-3">
		<p class="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/40">
			Workspace
		</p>
		<ul class="space-y-1">
			<SidebarItem link="/" title="Dashboard"><Dashboard /></SidebarItem>
			<SidebarItem link="/patients" title="Patients">
				<svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path
						d="M10 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM3.5 16.5a6.5 6.5 0 0113 0 .5.5 0 01-.5.5H4a.5.5 0 01-.5-.5z"
					/>
				</svg>
			</SidebarItem>
			<SidebarItem link="/record" title="Records">
				<svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path
						d="M5 2.5A1.5 1.5 0 016.5 1h4.7a1.5 1.5 0 011.06.44l3.3 3.3A1.5 1.5 0 0116 5.8V17.5A1.5 1.5 0 0114.5 19h-8A1.5 1.5 0 015 17.5v-15zM7 9a.75.75 0 000 1.5h6A.75.75 0 0013 9H7zm0 3.25a.75.75 0 000 1.5h6a.75.75 0 000-1.5H7z"
					/>
				</svg>
			</SidebarItem>
		</ul>

		<p class="px-3 pt-6 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/40">
			Administration
		</p>
		<ul class="space-y-1">
			<SidebarItem link="/users" title="Users"><Users /></SidebarItem>
			<SidebarItem link="/settings" title="Settings">
				<svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path
						fill-rule="evenodd"
						d="M8.34 2.6a1.4 1.4 0 013.32 0l.13.55a1.4 1.4 0 002 .84l.49-.27a1.4 1.4 0 011.86 1.94l-.28.5a1.4 1.4 0 00.83 2l.55.13a1.4 1.4 0 010 3.32l-.55.13a1.4 1.4 0 00-.83 2l.28.49a1.4 1.4 0 01-1.86 1.94l-.49-.27a1.4 1.4 0 00-2 .84l-.13.55a1.4 1.4 0 01-3.32 0l-.13-.55a1.4 1.4 0 00-2-.84l-.49.27a1.4 1.4 0 01-1.86-1.94l.28-.5a1.4 1.4 0 00-.83-2l-.55-.12a1.4 1.4 0 010-3.32l.55-.13a1.4 1.4 0 00.83-2l-.28-.5A1.4 1.4 0 015.72 3.72l.49.27a1.4 1.4 0 002-.84l.13-.55zM10 13a3 3 0 100-6 3 3 0 000 6z"
						clip-rule="evenodd"
					/>
				</svg>
			</SidebarItem>
		</ul>
	</nav>

	<div class="border-t border-white/10 px-5 py-4">
		<p class="text-[0.7rem] leading-relaxed text-white/45">
			Diagnostic laboratory<br />serving the community since <span class="font-mono text-white/70"
				>1997</span
			>.
		</p>
	</div>
</aside>
