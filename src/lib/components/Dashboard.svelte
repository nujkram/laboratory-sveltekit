<script>
	// @ts-nocheck
	// All values are computed in the DB (see /api/admin/dashboard):
	// summary = { counts, kpis, categories[], roles[], monthly[], topMedTechs[] }
	export let summary = {
		counts: { patients: 0, records: 0, users: 0 },
		kpis: { recordsThisMonth: 0, recordsToday: 0, patientsThisMonth: 0, activePatients: 0 },
		categories: [],
		roles: [],
		monthly: [],
		topMedTechs: []
	};

	$: counts = summary?.counts ?? { patients: 0, records: 0, users: 0 };
	$: kpis = summary?.kpis ?? { recordsThisMonth: 0, recordsToday: 0, patientsThisMonth: 0, activePatients: 0 };
	$: categories = summary?.categories ?? [];
	$: roles = summary?.roles ?? [];
	$: monthly = summary?.monthly ?? [];
	$: topMedTechs = summary?.topMedTechs ?? [];

	$: monthlyMax = Math.max(1, ...monthly.map((m) => m.count || 0));
	$: monthlyTotal = monthly.reduce((s, m) => s + (m.count || 0), 0);
	const barPct = (count, max) => Math.round(((count || 0) / Math.max(1, max)) * 100);

	$: kpiTiles = [
		{ label: 'Patients on file', value: counts.patients, sub: `${kpis.activePatients} active`, href: '/patients', accent: 'patients' },
		{ label: 'Total results', value: counts.records, sub: 'all time', href: '/record', accent: 'records' },
		{ label: 'Results this month', value: kpis.recordsThisMonth, sub: `${kpis.recordsToday} today`, href: '/record', accent: 'month' },
		{ label: 'New patients this month', value: kpis.patientsThisMonth, sub: `${counts.users} staff`, href: '/patients', accent: 'new' }
	];
</script>

<div class="animate-rise-in space-y-6">
	<div>
		<h2 class="font-display text-2xl font-bold text-ink">Laboratory at a glance</h2>
		<p class="mt-1 text-sm text-muted">Throughput, workload, and what's being tested most.</p>
	</div>

	<!-- KPI tiles -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each kpiTiles as t}
			<a
				href={t.href}
				class="group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 no-underline shadow-card transition-shadow hover:shadow-card-lg"
			>
				<div class="flex items-start justify-between">
					<span class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">{t.label}</span>
					<span class="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-soft text-pine-700" aria-hidden="true">
						{#if t.accent === 'patients'}
							<svg class="h-4.5 w-4.5 h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM3.5 16.5a6.5 6.5 0 0113 0 .5.5 0 01-.5.5H4a.5.5 0 01-.5-.5z" /></svg>
						{:else if t.accent === 'records'}
							<svg class="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2.5A1.5 1.5 0 016.5 1h4.7a1.5 1.5 0 011.06.44l3.3 3.3A1.5 1.5 0 0116 5.8V17.5A1.5 1.5 0 0114.5 19h-8A1.5 1.5 0 015 17.5v-15zM7 9a.75.75 0 000 1.5h6A.75.75 0 0013 9H7zm0 3.25a.75.75 0 000 1.5h6a.75.75 0 000-1.5H7z" /></svg>
						{:else if t.accent === 'month'}
							<svg class="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor"><path d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4A2.5 2.5 0 0117.5 6.5v9A2.5 2.5 0 0115 18H5a2.5 2.5 0 01-2.5-2.5v-9A2.5 2.5 0 015 4V2.75A.75.75 0 015.75 2zM4 8.5v7c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-7H4z" /></svg>
						{:else}
							<svg class="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>
						{/if}
					</span>
				</div>
				<div class="mt-4">
					<span class="font-mono text-3xl font-semibold tabular-nums text-ink">{t.value}</span>
					<span class="mt-0.5 block text-xs text-muted">{t.sub}</span>
				</div>
			</a>
		{/each}
	</div>

	<!-- Monthly volume trend -->
	<section class="rounded-xl border border-line bg-surface shadow-card">
		<header class="flex items-center justify-between border-b border-line px-5 py-4">
			<div>
				<h3 class="font-display text-base font-bold text-ink">Results recorded</h3>
				<p class="text-xs text-muted">Last 8 months</p>
			</div>
			<div class="text-right">
				<span class="font-mono text-lg font-semibold text-ink">{monthlyTotal}</span>
				<span class="block text-xs text-muted">in this window</span>
			</div>
		</header>
		<div class="px-5 py-5">
			{#if monthlyTotal === 0}
				<p class="py-10 text-center text-sm text-muted">No results recorded in the last 8 months yet.</p>
			{:else}
				<div class="flex h-44 items-end gap-2 border-b border-line">
					{#each monthly as m}
						<div
							class="group relative flex h-full flex-1 items-end"
							title="{m.label}: {m.count} result{m.count === 1 ? '' : 's'}"
						>
							<div
								class="w-full rounded-t-md bg-leaf/80 transition-all duration-500 group-hover:bg-leaf"
								style="height: {barPct(m.count, monthlyMax)}%"
							/>
							<span
								class="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] font-semibold text-ink opacity-0 transition-opacity group-hover:opacity-100"
								>{m.count}</span
							>
						</div>
					{/each}
				</div>
				<div class="mt-2 flex gap-2">
					{#each monthly as m}
						<span class="flex-1 text-center text-[0.68rem] font-medium text-muted">{m.label}</span>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- Breakdowns -->
	<div class="grid gap-4 lg:grid-cols-3">
		<!-- Records by category -->
		<section class="rounded-xl border border-line bg-surface shadow-card">
			<header class="flex items-center justify-between border-b border-line px-5 py-4">
				<h3 class="font-display text-base font-bold text-ink">Results by category</h3>
				<a href="/record" class="text-xs font-medium text-leaf no-underline hover:underline">Browse</a>
			</header>
			<ul class="divide-y divide-line">
				{#if categories.length}
					{#each categories as c}
						{@const max = Math.max(1, ...categories.map((x) => x.count || 0))}
						<li class="px-5 py-3">
							<div class="flex items-center justify-between">
								<a href="/record/category/{c.name}" class="text-sm font-medium text-ink no-underline hover:text-pine-700">{c.name}</a>
								<span class="font-mono text-sm font-semibold tabular-nums text-ink">{c.count || 0}</span>
							</div>
							<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
								<div class="h-full rounded-full bg-leaf transition-all duration-500" style="width: {barPct(c.count, max)}%" />
							</div>
						</li>
					{/each}
				{:else}
					<li class="px-5 py-6 text-sm text-muted">No categories yet.</li>
				{/if}
			</ul>
		</section>

		<!-- Top medical technologists -->
		<section class="rounded-xl border border-line bg-surface shadow-card">
			<header class="flex items-center justify-between border-b border-line px-5 py-4">
				<h3 class="font-display text-base font-bold text-ink">Top medical technologists</h3>
				<span class="text-xs text-muted">by results</span>
			</header>
			<ul class="divide-y divide-line">
				{#if topMedTechs.length}
					{#each topMedTechs as t}
						{@const max = Math.max(1, ...topMedTechs.map((x) => x.count || 0))}
						<li class="px-5 py-3">
							<div class="flex items-center justify-between">
								<span class="truncate pr-2 text-sm font-medium text-ink">{t.name}</span>
								<span class="font-mono text-sm font-semibold tabular-nums text-ink">{t.count || 0}</span>
							</div>
							<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
								<div class="h-full rounded-full bg-pine-500 transition-all duration-500" style="width: {barPct(t.count, max)}%" />
							</div>
						</li>
					{/each}
				{:else}
					<li class="px-5 py-6 text-sm text-muted">No results recorded yet.</li>
				{/if}
			</ul>
		</section>

		<!-- Staff by role -->
		<section class="rounded-xl border border-line bg-surface shadow-card">
			<header class="flex items-center justify-between border-b border-line px-5 py-4">
				<h3 class="font-display text-base font-bold text-ink">Staff by role</h3>
				<a href="/users" class="text-xs font-medium text-leaf no-underline hover:underline">View all</a>
			</header>
			<ul class="divide-y divide-line">
				{#if roles.length}
					{#each roles as role}
						{@const max = Math.max(1, ...roles.map((x) => x.count || 0))}
						<li class="px-5 py-3">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-ink">{role.name}</span>
								<span class="font-mono text-sm font-semibold tabular-nums text-ink">{role.count || 0}</span>
							</div>
							<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
								<div class="h-full rounded-full bg-pine-600 transition-all duration-500" style="width: {barPct(role.count, max)}%" />
							</div>
						</li>
					{/each}
				{:else}
					<li class="px-5 py-6 text-sm text-muted">No roles defined yet.</li>
				{/if}
			</ul>
		</section>
	</div>
</div>
