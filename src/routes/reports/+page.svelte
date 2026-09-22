<script>
	// @ts-nocheck
	// Takings for a period: what was charged, what was given away, what came in,
	// and who took it. Read-only — nothing on this page writes.
	//
	// Defaults to this month rather than today, because the question a manager
	// arrives with is almost always about the month so far, not the last few
	// hours.
	import { onMount } from 'svelte';
	import Button from '$lib/components/reusable/Button.svelte';
	import { formatPeso, formatAmount } from '$lib/utils/currency';
	import { discountTypeLabel } from '$lib/common/discounts';
	import { isOnline } from '$lib/stores/connectivity.js';

	let summary = null;
	let byDay = [];
	let byCashier = [];
	let byDiscountType = [];
	let loading = true;
	let loadError = '';

	let fromDate = firstOfMonth();
	let toDate = todayLocal();

	function pad(n) {
		return String(n).padStart(2, '0');
	}
	function todayLocal() {
		const now = new Date();
		return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	}
	function firstOfMonth() {
		const now = new Date();
		return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
	}

	// The browser owns the day boundaries: the server runs UTC, and a report that
	// rolled over at 8am local would be wrong every morning.
	function boundsOf(dayString, endOfDay) {
		if (!dayString) return '';
		const at = new Date(`${dayString}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`);
		return isNaN(at.getTime()) ? '' : at.toISOString();
	}

	async function load() {
		loading = true;
		loadError = '';
		try {
			const res = await fetch('/api/admin/lab-transaction/report', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					dateFrom: boundsOf(fromDate, false),
					dateTo: boundsOf(toDate, true),
					// Same reason the bounds are computed here: the per-day buckets have
					// to break where the working day breaks.
					timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
				})
			});
			const result = await res.json();
			if (result?.status === 'Success') {
				summary = result.summary;
				byDay = result.byDay ?? [];
				byCashier = result.byCashier ?? [];
				byDiscountType = result.byDiscountType ?? [];
			} else {
				loadError = result?.message || 'Could not load the report.';
			}
		} catch {
			loadError = $isOnline
				? 'Could not load the report.'
				: 'You are offline. Reports are only available online.';
		} finally {
			loading = false;
		}
	}

	function setThisMonth() {
		fromDate = firstOfMonth();
		toDate = todayLocal();
		load();
	}
	function setToday() {
		fromDate = todayLocal();
		toDate = todayLocal();
		load();
	}

	// This page prints ITSELF — it is a normal page, not one of the portalled
	// report modals app.css isolates — so it flags that to the print stylesheet
	// and clears the flag once the dialog closes.
	function printReport() {
		const done = () => {
			document.body.classList.remove('printing-report');
			window.removeEventListener('afterprint', done);
		};
		window.addEventListener('afterprint', done);
		document.body.classList.add('printing-report');
		window.print();
	}

	function dayLabel(day) {
		const at = new Date(`${day}T12:00:00`);
		return isNaN(at.getTime())
			? day
			: at.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' });
	}

	function longDay(day) {
		const at = new Date(`${day}T12:00:00`);
		return isNaN(at.getTime())
			? day
			: at.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
	}

	$: rangeLabel =
		fromDate === toDate ? longDay(fromDate) : `${longDay(fromDate)} – ${longDay(toDate)}`;

	// The busiest day sets the bar width; an empty period must not divide by zero.
	$: peakDay = byDay.reduce((max, row) => Math.max(max, row.netCentavos), 0) || 1;
	$: collectionRate =
		summary && summary.netCentavos > 0
			? Math.round((summary.collectedCentavos / summary.netCentavos) * 100)
			: null;

	onMount(load);
</script>

<svelte:head><title>Reports · Laboratory Information System</title></svelte:head>

<div class="animate-rise-in space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-display text-2xl font-bold text-ink">Laboratory takings</h2>
			<!-- Carries the range onto the printout, which otherwise says nothing
			     about what period it covers. -->
			<p class="mt-1 text-sm text-muted">
				{rangeLabel} · cancelled transactions excluded
			</p>
		</div>
		<div class="print-hide">
			<Button type="link" href="/laboratory" color="terciary" text="View transactions" />
		</div>
	</div>

	<!-- Range -->
	<div class="print-hide flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
		<div class="flex items-center gap-2">
			<label for="fromDate" class="text-sm text-muted">From</label>
			<input
				id="fromDate"
				type="date"
				bind:value={fromDate}
				on:change={load}
				class="rounded-lg border-line bg-surface py-2 px-3 text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
			/>
			<label for="toDate" class="text-sm text-muted">to</label>
			<input
				id="toDate"
				type="date"
				bind:value={toDate}
				on:change={load}
				class="rounded-lg border-line bg-surface py-2 px-3 text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
			/>
		</div>
		<button
			on:click={setToday}
			class="inline-flex items-center rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
		>
			Today
		</button>
		<button
			on:click={setThisMonth}
			class="inline-flex items-center rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
		>
			This month
		</button>
		<button
			on:click={printReport}
			class="ml-auto inline-flex items-center rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
		>
			Print
		</button>
	</div>

	{#if loading}
		<p class="rounded-xl border border-line bg-surface px-5 py-10 text-center text-sm text-muted shadow-card">
			Loading the report…
		</p>
	{:else if loadError}
		<p class="rounded-xl border border-danger/30 bg-danger/5 px-5 py-6 text-center text-sm font-medium text-danger">
			{loadError}
		</p>
	{:else if summary}
		<!-- Headline -->
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each [['Net charged', summary.netCentavos, 'text-ink'], ['Collected', summary.collectedCentavos, 'text-pine-700'], ['Outstanding', summary.outstandingCentavos, 'text-warning'], ['Discounts given', summary.discountCentavos, 'text-muted']] as [label, value, tone]}
				<div class="rounded-xl border border-line bg-surface p-4 shadow-card">
					<div class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
					<div class="mt-1 font-display text-xl font-bold tabular {tone}">{formatPeso(value)}</div>
				</div>
			{/each}
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Collections -->
			<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
				<div class="border-b border-line px-5 py-3">
					<h3 class="font-display text-base font-bold text-ink">Collections</h3>
				</div>
				<div class="px-5 py-4 text-sm">
					<div class="flex justify-between py-1">
						<span class="text-muted">Gross charged</span>
						<span class="tabular font-semibold text-ink">{formatPeso(summary.grossCentavos)}</span>
					</div>
					<div class="flex justify-between py-1">
						<span class="text-muted">Less: discounts</span>
						<span class="tabular font-semibold text-ink">-{formatAmount(summary.discountCentavos)}</span>
					</div>
					<div class="flex justify-between py-0.5 pl-4 text-xs">
						<span class="text-muted">Senior Citizen / PWD (statutory)</span>
						<span class="tabular text-muted">{formatAmount(summary.statutoryDiscountCentavos)}</span>
					</div>
					<div class="flex justify-between py-0.5 pl-4 text-xs">
						<span class="text-muted">Ad-hoc</span>
						<span class="tabular text-muted">{formatAmount(summary.otherDiscountCentavos)}</span>
					</div>
					<div class="mt-1 flex justify-between border-t border-line pt-2">
						<span class="font-medium text-ink">Net charged</span>
						<span class="tabular font-bold text-ink">{formatPeso(summary.netCentavos)}</span>
					</div>
					<div class="mt-3 flex justify-between border-t border-line pt-2">
						<span class="text-muted">Collected</span>
						<span class="tabular font-semibold text-pine-700">{formatPeso(summary.collectedCentavos)}</span>
					</div>
					<div class="flex justify-between py-1">
						<span class="text-muted">Outstanding</span>
						<span class="tabular font-semibold text-warning">{formatPeso(summary.outstandingCentavos)}</span>
					</div>

					<div class="mt-4 border-t border-line pt-3 text-xs text-muted">
						{summary.transactions} transaction{summary.transactions === 1 ? '' : 's'} ·
						{summary.paidCount} paid · {summary.unpaidCount} unpaid
						{#if summary.cancelledCount}
							· {summary.cancelledCount} cancelled (excluded)
						{/if}
						{#if collectionRate !== null}
							· {collectionRate}% collected
						{/if}
					</div>
				</div>
			</div>

			<!-- Who took the money -->
			<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
				<div class="border-b border-line px-5 py-3">
					<h3 class="font-display text-base font-bold text-ink">Collected by</h3>
				</div>
				{#if byCashier.length}
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-line text-left text-[0.7rem] uppercase tracking-[0.12em] text-muted">
								<th class="px-5 py-2 font-semibold">Cashier</th>
								<th class="px-5 py-2 text-center font-semibold">Txns</th>
								<th class="px-5 py-2 text-right font-semibold">Collected</th>
							</tr>
						</thead>
						<tbody>
							{#each byCashier as row}
								<tr class="border-b border-line/60 last:border-0">
									<td class="px-5 py-2 text-ink">{row.name}</td>
									<td class="px-5 py-2 text-center tabular text-muted">{row.transactions}</td>
									<td class="px-5 py-2 text-right tabular font-semibold text-ink">
										{formatPeso(row.collectedCentavos)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<p class="px-5 py-8 text-center text-sm text-muted">Nothing was collected in this period.</p>
				{/if}

				{#if byDiscountType.length}
					<div class="border-t border-line px-5 py-3">
						<h4 class="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
							Discounts by type
						</h4>
						{#each byDiscountType as row}
							<div class="flex justify-between py-0.5 text-sm">
								<span class="text-muted">
									{discountTypeLabel(row.type)}
									<span class="text-xs">({row.transactions})</span>
								</span>
								<span class="tabular font-semibold text-ink">{formatPeso(row.discountCentavos)}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Day by day -->
		<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
			<div class="border-b border-line px-5 py-3">
				<h3 class="font-display text-base font-bold text-ink">Day by day</h3>
			</div>
			{#if byDay.length}
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-line text-left text-[0.7rem] uppercase tracking-[0.12em] text-muted">
							<th class="px-5 py-2 font-semibold">Date</th>
							<th class="px-5 py-2 text-center font-semibold">Txns</th>
							<th class="px-5 py-2 text-right font-semibold">Net charged</th>
							<th class="px-5 py-2 text-right font-semibold">Collected</th>
							<th class="hidden px-5 py-2 sm:table-cell" />
						</tr>
					</thead>
					<tbody>
						{#each byDay as row}
							<tr class="border-b border-line/60 last:border-0">
								<td class="px-5 py-2 text-ink">{dayLabel(row.day)}</td>
								<td class="px-5 py-2 text-center tabular text-muted">{row.transactions}</td>
								<td class="px-5 py-2 text-right tabular text-ink">{formatPeso(row.netCentavos)}</td>
								<td class="px-5 py-2 text-right tabular text-pine-700">
									{formatPeso(row.collectedCentavos)}
								</td>
								<td class="hidden w-40 px-5 py-2 sm:table-cell">
									<!-- A bar rather than a chart: it answers "which days were busy"
									     at a glance and needs no charting library on this page. -->
									<div class="h-2 rounded-full bg-paper">
										<div
											class="h-2 rounded-full bg-leaf"
											style="width: {Math.max(2, (row.netCentavos / peakDay) * 100)}%"
										/>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<p class="px-5 py-10 text-center text-sm text-muted">
					No transactions in this period.
				</p>
			{/if}
		</div>
	{/if}
</div>
