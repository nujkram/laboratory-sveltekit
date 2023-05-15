<script>
	import Dashboard from './icons/Dashboard.svelte';
	import Payroll from './icons/Payroll.svelte';
	import Records from './icons/Records.svelte';
	import Renumeration from './icons/Renumeration.svelte';
	import Users from './icons/Users.svelte';

	// @ts-nocheck
	import SidebarItem from './SidebarItem.svelte';
</script>

<aside
	id="logo-sidebar"
	class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
	aria-label="Sidebar"
>
	{#if SidebarItem}
		<SidebarItem link="/" title="Dashboard"><Dashboard /></SidebarItem>
		<SidebarItem link="/patients" title="Patients"><Users /></SidebarItem>
		<SidebarItem link="/users" title="Users"><Users /></SidebarItem>
		<SidebarItem link="/settings" title="Settings"><Records /></SidebarItem>
	{/if}
</aside>
