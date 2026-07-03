<script>
	// @ts-nocheck
	import Button from '$lib/components/reusable/Button.svelte';

	const categories = [
		{
			name: 'Hematology',
			desc: 'Blood counts and cell studies — CBC, platelets, differentials.',
			path: 'M10 2a1 1 0 01.8.4l4.2 5.6a6 6 0 11-10 0L9.2 2.4A1 1 0 0110 2z'
		},
		{
			name: 'Chemistry',
			desc: 'Metabolic and organ-function panels — glucose, lipids, enzymes.',
			path: 'M8 2a1 1 0 000 2h.5v3.6L4.3 14A2.4 2.4 0 006.3 18h7.4a2.4 2.4 0 002-3.9L11.5 7.6V4H12a1 1 0 100-2H8z'
		},
		{
			name: 'Urinalysis',
			desc: 'Physical, chemical, and microscopic examination of urine.',
			path: 'M10 2a1 1 0 011 1v8.3a3.5 3.5 0 11-2 0V3a1 1 0 011-1z'
		},
		{
			name: 'Parasitology',
			desc: 'Stool and specimen screening for ova and parasites.',
			path: 'M10 4a6 6 0 100 12 6 6 0 000-12zm0 3a3 3 0 100 6 3 3 0 000-6z'
		},
		{
			name: 'Miscellaneous',
			desc: 'Serology and other specialized diagnostic tests.',
			path: 'M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm2 4h6a1 1 0 010 2H7a1 1 0 010-2zm0 4h6a1 1 0 010 2H7a1 1 0 010-2z'
		}
	];
</script>

<div class="animate-rise-in space-y-6">
	<div>
		<h2 class="font-display text-2xl font-bold text-ink">Laboratory records</h2>
		<p class="mt-1 text-sm text-muted">
			Results are filed against a patient's chart. Open a patient to view their history or record a
			new result.
		</p>
	</div>

	<!-- Flow prompt -->
	<div
		class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-card"
	>
		<div class="flex items-start gap-4">
			<span class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-soft text-pine-700">
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path d="M10 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM3.5 16.5a6.5 6.5 0 0113 0 .5.5 0 01-.5.5H4a.5.5 0 01-.5-.5z" />
				</svg>
			</span>
			<div>
				<h3 class="font-display text-base font-bold text-ink">Start from a patient</h3>
				<p class="mt-1 max-w-xl text-sm text-muted">
					Search the registry, open the right chart, then add a Hematology, Chemistry, Urinalysis,
					Parasitology, or Miscellaneous result.
				</p>
			</div>
		</div>
		<Button color="primary" type="link" href="/patients" text="Browse patients" padding="py-2 px-4">
			<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path fill-rule="evenodd" d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4l4.3-4.3-4.3-4.3a1 1 0 010-1.4z" clip-rule="evenodd" />
			</svg>
		</Button>
	</div>

	<!-- Category legend -->
	<div>
		<p class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
			Browse by category
		</p>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each categories as c}
				<a
					href="/record/category/{c.name}"
					class="group flex flex-col rounded-xl border border-line bg-surface p-5 no-underline shadow-card transition-shadow hover:shadow-card-lg"
				>
					<div class="flex items-start justify-between">
						<span class="flex h-9 w-9 items-center justify-center rounded-lg bg-leaf-soft text-pine-700">
							<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path d={c.path} />
							</svg>
						</span>
						<svg class="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-leaf" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L11.58 10 7.3 5.7a1 1 0 010-1.4z" clip-rule="evenodd" />
						</svg>
					</div>
					<h4 class="mt-3 font-display text-base font-bold text-ink">{c.name}</h4>
					<p class="mt-1 text-sm leading-relaxed text-muted">{c.desc}</p>
					<span class="mt-3 text-xs font-medium text-leaf">View all {c.name} results →</span>
				</a>
			{/each}
		</div>
	</div>
</div>
