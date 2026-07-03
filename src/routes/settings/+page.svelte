<script>
	// @ts-nocheck
	import { fade } from 'svelte/transition';
	import Logo from '$lib/components/Logo.svelte';
	import { saveOrQueue } from '$lib/client/saveOrQueue.js';
	export let data;
	const { settings } = data;

	let name = settings?.name;
	let location = settings?.location;
	let mobile = settings?.mobile;
	let message;
	let saving = false;

	async function handleSubmit() {
		saving = true;
		try {
			const res = await saveOrQueue({
				endpoint: '/api/admin/settings/update',
				entity: 'settings',
				isCreate: false,
				body: { _id: settings._id, name, location, mobile }
			});
			message = res.synced ? (res.result?.message || 'Settings saved.') : 'Saved offline — will sync automatically.';
			setTimeout(() => (message = null), 3000);
		} catch (error) {
			console.error('error', error);
		} finally {
			saving = false;
		}
	}
</script>

<div class="animate-rise-in mx-auto max-w-2xl space-y-6">
	<div>
		<h2 class="font-display text-2xl font-bold text-ink">Settings</h2>
		<p class="mt-1 text-sm text-muted">
			These details appear on the sign-in screen and printed reports.
		</p>
	</div>

	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		<!-- Identity preview -->
		<div class="flex items-center gap-4 border-b border-line bg-paper px-6 py-5">
			<span class="text-pine-700"><Logo size={44} /></span>
			<div class="leading-tight">
				<p class="font-display text-lg font-bold text-ink">{name || 'Laboratory name'}</p>
				<p class="text-sm text-muted">{location || 'Location'}</p>
			</div>
		</div>

		<form class="space-y-5 px-6 py-6" on:submit|preventDefault={handleSubmit}>
			<div>
				<label for="inline-name" class="mb-1.5 block text-sm font-medium text-ink">
					Laboratory name
				</label>
				<input
					id="inline-name"
					type="text"
					bind:value={name}
					class="w-full rounded-lg border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				/>
			</div>

			<div>
				<label for="inline-location" class="mb-1.5 block text-sm font-medium text-ink">
					Location
				</label>
				<input
					id="inline-location"
					type="text"
					bind:value={location}
					class="w-full rounded-lg border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				/>
			</div>

			<div>
				<label for="inline-mobile" class="mb-1.5 block text-sm font-medium text-ink">
					Mobile number
				</label>
				<input
					id="inline-mobile"
					type="text"
					bind:value={mobile}
					class="w-full rounded-lg border-line bg-surface px-3.5 py-2.5 font-mono text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				/>
			</div>

			<div class="flex items-center gap-3 border-t border-line pt-5">
				<button
					type="submit"
					disabled={saving}
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-70"
				>
					{saving ? 'Saving…' : 'Save changes'}
				</button>
				{#if message}
					<span
						transition:fade
						class="inline-flex items-center gap-2 text-sm font-medium text-success"
						role="status"
					>
						<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4l2.8 2.79 6.8-6.8a1 1 0 011.4 0z" clip-rule="evenodd" />
						</svg>
						{message}
					</span>
				{/if}
			</div>
		</form>
	</div>
</div>
