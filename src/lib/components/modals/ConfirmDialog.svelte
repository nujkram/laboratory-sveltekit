<script>
	// @ts-nocheck
	// A plain yes/no confirmation in the app's own dialog style — for the
	// actions that deserve a pause but not the type-DELETE friction of
	// ConfirmHardDelete. Emits `confirm` and `cancel`; the parent closes it by
	// setting `open` back to false.
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/reusable/Button.svelte';

	export let open = false;
	export let title = 'Are you sure?';
	export let confirmLabel = 'Confirm';
	export let cancelLabel = 'Cancel';
	/** danger styles the confirm button red and the icon as a warning */
	export let danger = false;
	export let busy = false;

	const dispatch = createEventDispatcher();

	function close() {
		if (busy) return;
		open = false;
		dispatch('cancel');
	}
	function confirm() {
		if (busy) return;
		dispatch('confirm');
	}
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && open && close()} />

{#if open}
	<div class="fixed z-10 inset-0 overflow-y-auto" transition:fade={{ duration: 120 }}>
		<div class="flex items-center justify-center min-h-screen p-4">
			<div class="fixed inset-0 bg-ink/40 backdrop-blur-sm" on:click={close} />
			<div
				class="relative z-50 w-full max-w-md rounded-xl border border-line bg-surface shadow-card-lg"
				role="dialog"
				aria-modal="true"
				aria-labelledby="confirm-dialog-title"
			>
				<div class="px-6 py-6 text-center">
					<span
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-full {danger
							? 'bg-danger/10 text-danger'
							: 'bg-warning/10 text-warning'}"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.94l-7.5 12.99A1.5 1.5 0 004.14 19.5h15.72a1.5 1.5 0 001.3-2.57l-7.5-12.99a1.5 1.5 0 00-2.62 0z" />
						</svg>
					</span>
					<h3 id="confirm-dialog-title" class="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
					<div class="mt-2 text-sm text-muted">
						<slot />
					</div>
					<div class="mt-6 flex justify-center gap-2">
						<Button color="secondary" text={cancelLabel} on:click={close} disabled={busy} />
						<Button color={danger ? 'danger' : 'primary'} text={confirmLabel} on:click={confirm} disabled={busy} />
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
