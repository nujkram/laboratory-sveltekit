<script>
	// @ts-nocheck
	import { formatDateMDY } from '$lib/utils/dateHelper.js';

	export let data;

	let { profileUser } = data;

	$: profile = profileUser?.profile ?? {};
	$: fullName =
		[profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') ||
		profile.displayName ||
		'—';
	$: email = profile.email || profileUser?.emails?.[0]?.address || '—';
	$: emailVerified = profileUser?.emails?.[0]?.verified;

	const details = () => [
		{ label: 'Email', value: email, mono: true },
		{ label: 'Phone', value: profile.phone || '—' },
		{ label: 'Province', value: profile.province || '—' },
		{ label: 'Country', value: profile.country || '—' },
		{ label: 'License', value: profileUser?.license || '—', mono: true },
		{ label: 'Role', value: profileUser?.role || '—' },
		{ label: 'Created', value: profileUser?.createdAt ? formatDateMDY(profileUser.createdAt) : '—', mono: true },
		{ label: 'Email verified', value: emailVerified ? 'Yes' : 'No' }
	];
</script>

<div class="animate-rise-in space-y-6">
	<a
		href="/users"
		class="inline-flex items-center gap-1.5 text-sm font-medium text-muted no-underline transition-colors hover:text-pine-700"
	>
		<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path fill-rule="evenodd" d="M12.7 15.7a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 1.4L8.42 10l4.3 4.3a1 1 0 010 1.4z" clip-rule="evenodd" />
		</svg>
		All users
	</a>

	<!-- User header -->
	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		<div class="flex flex-wrap items-center gap-5 bg-pine-fade px-6 py-6 text-white">
			{#if profile?.photo?.url}
				<img
					class="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white/15"
					src={profile.photo.url}
					alt={fullName}
				/>
			{:else}
				<span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-leaf-active ring-2 ring-white/15">
					<svg class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path d="M10 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM3.5 16.5a6.5 6.5 0 0113 0 .5.5 0 01-.5.5H4a.5.5 0 01-.5-.5z" />
					</svg>
				</span>
			{/if}
			<div class="min-w-0">
				<h2 class="font-display text-2xl font-bold leading-tight">{fullName}</h2>
				<div class="mt-2 flex flex-wrap items-center gap-2">
					{#if profileUser?.role}
						<span class="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-leaf-active">
							{profileUser.role}
						</span>
					{/if}
					<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {profileUser?.isActive ? 'bg-white/10 text-leaf-active' : 'bg-danger/20 text-white'}">
						<span class="h-1.5 w-1.5 rounded-full {profileUser?.isActive ? 'bg-leaf-active' : 'bg-danger'}" />
						{profileUser?.isActive ? 'Active' : 'Inactive'}
					</span>
				</div>
			</div>
		</div>
		<dl class="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-x">
			{#each details() as item}
				<div class="px-6 py-3">
					<dt class="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</dt>
					<dd class="mt-0.5 text-sm text-ink {item.mono ? 'font-mono text-xs' : ''}">{item.value}</dd>
				</div>
			{/each}
		</dl>
	</div>
</div>
