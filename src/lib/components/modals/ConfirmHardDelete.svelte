<script>
	// @ts-nocheck
	// A deliberately high-friction confirmation for irreversible hard deletes:
	// the admin must type DELETE before the button enables. Emits `confirm`.
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/reusable/Button.svelte';

	export let open = false;
	export let title = 'Delete permanently';
	export let name = 'this item';
	export let busy = false;
	export let error = null;

	const CONFIRM_WORD = 'DELETE';
	const dispatch = createEventDispatcher();
	let typed = '';

	$: canDelete = typed.trim().toUpperCase() === CONFIRM_WORD && !busy;

	function close() {
		if (busy) return;
		typed = '';
		open = false;
		dispatch('cancel');
	}

	function confirm() {
		if (!canDelete) return;
		dispatch('confirm');
	}
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && open && close()} />

<div class="fixed z-10 inset-0 overflow-y-auto {open ? 'block' : 'hidden'}">
	<div class="flex items-center justify-center min-h-screen p-4">
		<div class="fixed inset-0 bg-ink/40 backdrop-blur-sm" on:click={close} />
		<div class="relative z-50 w-full max-w-md rounded-xl border border-line bg-surface shadow-card-lg">
			<div class="px-6 py-6 text-center">
				<span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.35 9m-4.78 0L9.26 9M9.968 3.142A2.25 2.25 0 0112.09 1.5h-.18a2.25 2.25 0 012.122 1.642M4.5 5.79h15M18.75 5.79l-.84 12.6a2.25 2.25 0 01-2.244 2.1H8.334a2.25 2.25 0 01-2.244-2.1l-.84-12.6" />
					</svg>
				</span>
				<h3 class="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
				<p class="mt-2 text-sm text-muted">
					This permanently deletes <span class="font-semibold text-ink">{name}</span>. This
					<span class="font-semibold text-danger">cannot be undone</span>.
				</p>

				<div class="mt-4 text-left">
					<label for="confirm-delete" class="mb-1.5 block text-xs font-medium text-muted">
						Type <span class="font-mono font-semibold text-ink">{CONFIRM_WORD}</span> to confirm
					</label>
					<input
						id="confirm-delete"
						type="text"
						autocomplete="off"
						bind:value={typed}
						on:keydown={(e) => e.key === 'Enter' && confirm()}
						class="field"
						placeholder={CONFIRM_WORD}
					/>
				</div>

				{#if error}
					<div transition:fade class="mt-4 flex items-center justify-center rounded bg-danger/10 px-4 py-3 text-sm font-medium text-danger" role="alert">
						<p>{error}</p>
					</div>
				{/if}

				<div class="mt-6 flex justify-center gap-2">
					<Button color="secondary" text="Cancel" on:click={close} disabled={busy} />
					<Button color="danger" text={busy ? 'Deleting…' : 'Delete permanently'} disabled={!canDelete} on:click={confirm} />
				</div>
			</div>
		</div>
	</div>
</div>
