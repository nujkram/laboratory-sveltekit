<script>
	// @ts-nocheck
	import AccountProfileForm from '$lib/components/forms/account/AccountProfileForm.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { isOnline, pendingCount, syncBlocked } from '$lib/stores/connectivity.js';

	// Passed from the layout so it survives offline (cached user fallback).
	export let user = null;
	$: profile = user?.profile ?? $page.data.user?.profile ?? {};
	$: fullName = profile.displayName ?? '';
	$: imgsrc = profile.photo?.url ?? '';

	let isAccountProfileOpen = false;
	let isDropdownOpen = false;

	const sectionTitles = {
		'': 'Dashboard',
		patients: 'Patients',
		record: 'Laboratory Records',
		users: 'Users',
		settings: 'Settings'
	};
	$: segment = $page.url.pathname.split('/')[1] ?? '';
	$: title = sectionTitles[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);

	function handleToggleDropDown() {
		isDropdownOpen = !isDropdownOpen;
	}
	function handleOpenUserProfile() {
		isAccountProfileOpen = !isAccountProfileOpen;
		handleToggleDropDown();
	}
	function handleLogout() {
		goto('auth/logout/');
	}
</script>

<svelte:window on:click={() => (isDropdownOpen = false)} />

<header
	id="app-topbar"
	class="fixed top-0 left-0 right-0 z-30 h-16 border-b border-line bg-surface/85 backdrop-blur sm:left-64"
>
	<div class="flex h-full items-center justify-between px-5 lg:px-7">
		<div class="flex items-center gap-3">
			<div class="flex flex-col leading-none">
				<span class="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-leaf">Workspace</span
				>
				<h1 class="mt-0.5 font-display text-lg font-bold text-ink">{title}</h1>
			</div>
			{#if !$isOnline}
				<span class="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning" title="You're offline. Entries save on this device and sync automatically when back online.">
					<span class="h-1.5 w-1.5 rounded-full bg-warning" />
					Offline
				</span>
			{/if}
			{#if $pendingCount > 0}
				<a href="/pending" class="inline-flex items-center gap-1.5 rounded-full bg-leaf-soft px-2.5 py-1 text-xs font-medium text-pine-700 no-underline transition-colors hover:bg-leaf/20" title="Entries waiting to sync — click to view">
					<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm.75 3.5a.75.75 0 00-1.5 0V10c0 .2.08.39.22.53l2.5 2.5a.75.75 0 101.06-1.06L10.75 9.7V6.5z" clip-rule="evenodd" /></svg>
					{$pendingCount} pending
				</a>
			{/if}
			{#if $syncBlocked}
				<a href="/auth/login" class="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger no-underline transition-colors hover:bg-danger/20" title="Your session expired — sign in again to upload queued entries">
					<span class="h-1.5 w-1.5 rounded-full bg-danger" />
					Sign in to sync
				</a>
			{/if}
		</div>

		<div class="relative">
			<button
				type="button"
				class="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3 text-sm font-medium text-ink transition-colors hover:border-pine-500/40 hover:bg-paper"
				aria-haspopup="true"
				aria-expanded={isDropdownOpen}
				on:click|stopPropagation={handleToggleDropDown}
			>
				<img
					class="h-7 w-7 rounded-full object-cover ring-2 ring-leaf-soft"
					src={imgsrc}
					alt=""
				/>
				<span class="hidden sm:inline">{fullName}</span>
				<svg
					class="h-4 w-4 text-muted transition-transform duration-200 {isDropdownOpen
						? 'rotate-180'
						: ''}"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>

			{#if isDropdownOpen}
				<div
					class="absolute right-0 z-50 mt-2 w-52 origin-top-right animate-fade-in overflow-hidden rounded-xl border border-line bg-surface shadow-card-lg"
					role="menu"
					on:click|stopPropagation
				>
					<div class="border-b border-line px-4 py-3">
						<p class="truncate text-sm font-semibold text-ink">{fullName}</p>
						<p class="truncate text-xs text-muted">{profile.email}</p>
					</div>
					<div class="p-1.5">
						<button
							class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-paper"
							on:click={handleOpenUserProfile}
							role="menuitem"
						>
							<svg class="h-4 w-4 text-muted" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path
									d="M10 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM3.5 16.5a6.5 6.5 0 0113 0 .5.5 0 01-.5.5H4a.5.5 0 01-.5-.5z"
								/>
							</svg>
							Profile
						</button>
						<button
							class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/5"
							on:click={handleLogout}
							role="menuitem"
						>
							<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path
									fill-rule="evenodd"
									d="M3 4.5A1.5 1.5 0 014.5 3H9a.75.75 0 010 1.5H4.5v11H9A.75.75 0 019 17H4.5A1.5 1.5 0 013 15.5v-11zm10.72 2.47a.75.75 0 011.06 0l2.75 2.75a.75.75 0 010 1.06l-2.75 2.75a.75.75 0 11-1.06-1.06l1.47-1.47H8.75a.75.75 0 010-1.5h6.44l-1.47-1.47a.75.75 0 010-1.06z"
									clip-rule="evenodd"
								/>
							</svg>
							Log out
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</header>

{#if isAccountProfileOpen}
	<AccountProfileForm bind:isAccountProfileOpen />
{/if}
