<script>
	// @ts-nocheck
	// Daily laboratory transactions. Defaults to today and lets an authorised
	// employee filter by date range, payment status, transaction status and
	// encoder, or search by reference number / name / requesting doctor.
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Button from '$lib/components/reusable/Button.svelte';
	import Sort from '$lib/components/reusable/Sort.svelte';
	import LabReceiptModal from '$lib/components/modals/LabReceiptModal.svelte';
	import ChemistryModal from '$lib/components/modals/ChemistryModal.svelte';
	import HematologyModal from '$lib/components/modals/HematologyModal.svelte';
	import UrinalysisModal from '$lib/components/modals/UrinalysisModal.svelte';
	import ParasitologyModal from '$lib/components/modals/ParasitologyModal.svelte';
	import MiscModal from '$lib/components/modals/MiscModal.svelte';
	import { formatPeso } from '$lib/utils/currency';
	import { categoryBadge, categoryBadgeBase } from '$lib/constants/categoryColors.js';
	import { canView } from '$lib/common/access';
	import { isOnline } from '$lib/stores/connectivity.js';

	let items = [];
	let itemSize = 0;
	let summary = { netCentavos: 0, paidCentavos: 0, unpaidCentavos: 0 };
	let loading = true;
	let loadError = '';

	let currentPage = 1;
	let pageSize = 10;
	let sortBy = 'created';
	let sortOrder = 'desc';

	let search = '';
	let searchTimer;
	let paymentStatus = 'all';
	let status = 'all';
	let resultStatus = 'all';
	let mineOnly = false;

	let fromDate = todayLocal();
	let toDate = todayLocal();

	let isViewModalOpen = false;
	let currentTransaction = null;

	// The result report, opened in place rather than via the patient chart.
	let isResultOpen = false;
	let currentResult = null;
	let loadingResultId = '';
	let resultError = '';
	// A slip with several results gets a picker before the report.
	let pickingFrom = null;

	$: canEncode = canView($page.data.user, '/record');
	$: pageMinIndex = itemSize === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	$: pageMaxIndex = Math.min(currentPage * pageSize, itemSize);

	function todayLocal() {
		const now = new Date();
		const pad = (n) => String(n).padStart(2, '0');
		return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	}

	// The browser owns the day boundaries: "today" must mean today in Roxas
	// City, and the server runs in UTC.
	function boundsOf(dayString, endOfDay) {
		if (!dayString) return '';
		const at = new Date(`${dayString}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`);
		return isNaN(at.getTime()) ? '' : at.toISOString();
	}

	async function loadTransactions() {
		loading = true;
		loadError = '';
		try {
			const res = await fetch('/api/admin/lab-transaction', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					page: currentPage,
					pageSize,
					sortBy,
					sortOrder,
					search,
					paymentStatus,
					status,
					resultStatus,
					createdBy: mineOnly ? $page.data.user?._id ?? '' : '',
					dateFrom: boundsOf(fromDate, false),
					dateTo: boundsOf(toDate, true)
				})
			});
			const result = await res.json();
			if (result?.status === 'Success') {
				items = result.response ?? [];
				itemSize = result.total ?? 0;
				summary = result.summary ?? summary;
			} else {
				loadError = result?.message || 'Could not load transactions.';
				items = [];
				itemSize = 0;
			}
		} catch {
			loadError = $isOnline
				? 'Could not load transactions.'
				: 'You are offline. Laboratory transactions are only available online.';
			items = [];
			itemSize = 0;
		} finally {
			loading = false;
		}
	}

	// One line per encoded result, for the badge's hover title.
	function describeResults(row) {
		return (row.results ?? [])
			.map((r) => `${r.caseNumber ? `Case ${r.caseNumber}` : 'Pending case no.'} · ${r.category}`)
			.join('\n');
	}

	// Why a slip cannot take a result right now, or '' when it can.
	function resultBlocker(row) {
		if (row.status === 'Cancelled') return 'This slip was cancelled';
		if (!row.patientId) return 'Walk-in customer — register them as a patient first';
		return '';
	}

	function refilter() {
		currentPage = 1;
		loadTransactions();
	}

	function handleSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(refilter, 300);
	}

	function handleSort(field) {
		if (sortBy === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortOrder = 'desc';
		}
		refilter();
	}

	function setToday() {
		fromDate = todayLocal();
		toDate = todayLocal();
		refilter();
	}

	function incrementPageNumber() {
		if (pageMaxIndex < itemSize) {
			currentPage += 1;
			loadTransactions();
		}
	}

	function decrementPageNumber() {
		if (currentPage > 1) {
			currentPage -= 1;
			loadTransactions();
		}
	}

	function handleOverFlow() {
		pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
		refilter();
	}

	function openSlip(transaction) {
		currentTransaction = transaction;
		isViewModalOpen = true;
	}

	// Fetch the record and its patient, then show the same report modal the
	// patient chart uses. The single-record endpoint joins the transaction (for
	// the release gate) but not the patient, so that is fetched alongside.
	function viewResults(row) {
		const results = row.results ?? [];
		if (results.length === 1) openResult(row, results[0]._id);
		else if (results.length > 1) pickingFrom = row;
	}

	async function openResult(row, id) {
		if (!id || loadingResultId) return;
		loadingResultId = id;
		resultError = '';
		try {
			const [recordRes, patientRes] = await Promise.all([
				fetch(`/api/admin/record/${id}`),
				fetch(`/api/admin/patient/${row.patientId}`)
			]);
			const record = (await recordRes.json())?.response;
			const patient = (await patientRes.json())?.response;
			if (!record) {
				resultError = 'That result could not be found — it may have been deleted.';
				return;
			}
			currentResult = { ...record, patient };
			pickingFrom = null;
			isResultOpen = true;
		} catch {
			resultError = $isOnline
				? 'Could not open the result. Please try again.'
				: 'You are offline. Results can only be opened online.';
		} finally {
			loadingResultId = '';
		}
	}

	function dateTime(value) {
		if (!value) return '';
		const at = new Date(value);
		if (isNaN(at.getTime())) return '';
		return at.toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function encoderName(row) {
		const by = row?.createdBy;
		return by?.profile?.firstName || by?.name || by?.email || '—';
	}

	onMount(loadTransactions);
</script>

<svelte:head><title>Transactions · Laboratory Information System</title></svelte:head>

<div class="animate-rise-in space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-display text-2xl font-bold text-ink">Laboratory transactions</h2>
			<p class="mt-1 text-sm text-muted">
				<span class="font-mono">{itemSize}</span> transaction{itemSize === 1 ? '' : 's'} in the selected
				range.
			</p>
		</div>
		<!-- a cashier may read this list but not encode a request; offering the
		     button would just bounce them back here -->
		{#if canView($page.data.user, '/laboratory/request/new')}
			<Button type="link" href="/laboratory/request/new" color="primary" text="New request" />
		{/if}
	</div>

	<!-- Range totals -->
	<div class="grid gap-3 sm:grid-cols-3">
		{#each [['Total charged', summary.netCentavos, 'text-ink'], ['Paid', summary.paidCentavos, 'text-pine-700'], ['Unpaid', summary.unpaidCentavos, 'text-warning']] as [label, value, tone]}
			<div class="rounded-xl border border-line bg-surface p-4 shadow-card">
				<div class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
				<div class="mt-1 font-display text-xl font-bold tabular {tone}">{formatPeso(value)}</div>
			</div>
		{/each}
	</div>

	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		<!-- Toolbar -->
		<div class="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
			<div class="flex items-center gap-2">
				<label for="fromDate" class="text-sm text-muted">From</label>
				<input
					id="fromDate"
					type="date"
					bind:value={fromDate}
					on:change={refilter}
					class="rounded-lg border-line bg-surface py-2 px-3 text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				/>
				<label for="toDate" class="text-sm text-muted">to</label>
				<input
					id="toDate"
					type="date"
					bind:value={toDate}
					on:change={refilter}
					class="rounded-lg border-line bg-surface py-2 px-3 text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				/>
				<button
					on:click={setToday}
					class="inline-flex items-center rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
				>
					Today
				</button>
			</div>

			<div>
				<label for="paymentStatus" class="sr-only">Payment status</label>
				<select
					id="paymentStatus"
					bind:value={paymentStatus}
					on:change={refilter}
					class="rounded-lg border-line bg-surface py-2 pl-3 pr-9 text-sm font-medium text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				>
					<option value="all">All payments</option>
					<option value="Unpaid">Unpaid</option>
					<option value="Paid">Paid</option>
				</select>
			</div>

			<div>
				<label for="status" class="sr-only">Transaction status</label>
				<select
					id="status"
					bind:value={status}
					on:change={refilter}
					class="rounded-lg border-line bg-surface py-2 pl-3 pr-9 text-sm font-medium text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				>
					<option value="all">All statuses</option>
					<option value="Pending">Pending</option>
					<option value="Cancelled">Cancelled</option>
				</select>
			</div>

			<div>
				<label for="resultStatus" class="sr-only">Result status</label>
				<select
					id="resultStatus"
					bind:value={resultStatus}
					on:change={refilter}
					class="rounded-lg border-line bg-surface py-2 pl-3 pr-9 text-sm font-medium text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				>
					<option value="all">All results</option>
					<option value="Awaiting">Awaiting result</option>
					<option value="Encoded">Result encoded</option>
				</select>
			</div>

			<label class="flex items-center gap-2 text-sm text-muted">
				<input
					type="checkbox"
					bind:checked={mineOnly}
					on:change={refilter}
					class="rounded border-line text-leaf focus:ring-2 focus:ring-leaf/25"
				/>
				Mine only
			</label>

			<div class="relative min-w-[12rem] flex-1">
				<span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
							clip-rule="evenodd"
						/>
					</svg>
				</span>
				<!-- A slip scanned here should land in the search straight away, so the
				     field takes focus on arrival (SvelteKit honours `autofocus` when it
				     resets focus after navigation). -->
				<!-- svelte-ignore a11y-autofocus -->
				<input
					type="search"
					bind:value={search}
					on:input={handleSearch}
					autofocus
					placeholder="Search reference, name or doctor…"
					class="w-full rounded-lg border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				/>
			</div>
		</div>

		{#if resultError}
			<p class="border-b border-line bg-danger/10 px-5 py-2 text-sm font-medium text-danger" role="alert">{resultError}</p>
		{/if}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead
					class="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-muted"
				>
					<tr>
						<th scope="col" class="px-5 py-3 font-semibold">
							<span class="inline-flex items-center gap-1">
								Reference <Sort on:click={() => handleSort('transactionNo')} />
							</span>
						</th>
						<!-- the widest free-text column; without a floor the nowrap columns
						     squeeze it until names wrap to four lines -->
						<th scope="col" class="min-w-[13rem] px-5 py-3 font-semibold">Patient / customer</th>
						<th scope="col" class="px-5 py-3 font-semibold">
							<span class="inline-flex items-center gap-1">
								Date &amp; time <Sort on:click={() => handleSort('created')} />
							</span>
						</th>
						<th scope="col" class="px-5 py-3 font-semibold">Tests</th>
						<th scope="col" class="px-5 py-3 text-right font-semibold">
							<span class="inline-flex items-center gap-1">
								Total <Sort on:click={() => handleSort('netCentavos')} />
							</span>
						</th>
						<th scope="col" class="px-5 py-3 font-semibold">Payment</th>
						<th scope="col" class="px-5 py-3 font-semibold">Result</th>
						<th scope="col" class="px-5 py-3 font-semibold">Encoded by</th>
						<th scope="col" class="px-5 py-3 text-right font-semibold">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-line">
					{#if loading}
						<tr>
							<td colspan="9" class="px-5 py-14 text-center">
								<div class="flex items-center justify-center gap-3 text-muted">
									<svg class="h-5 w-5 animate-spin text-leaf" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
										<path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
									</svg>
									<span class="text-sm font-medium">Loading transactions…</span>
								</div>
							</td>
						</tr>
					{:else if items.length}
						{#each items as row (row._id)}
							<tr class="transition-colors hover:bg-paper">
								<td class="whitespace-nowrap px-5 py-3 font-mono font-semibold text-ink">
									{row.referenceNumber}
								</td>
								<td class="min-w-[13rem] px-5 py-3 font-medium text-ink">
									{row.customer?.name || '—'}
									{#if row.requestedBy}
										<span class="block truncate text-xs font-normal text-muted" title={row.requestedBy}>
											Requested by {row.requestedBy}
										</span>
									{/if}
								</td>
								<td class="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted">
									{dateTime(row.created)}
								</td>
								<td class="whitespace-nowrap px-5 py-3 text-muted">
									<span title={(row.items ?? []).map((i) => `${i.code} ${i.name} ×${i.qty}`).join('\n')}>
										{(row.items ?? []).length} test{(row.items ?? []).length === 1 ? '' : 's'}
									</span>
								</td>
								<td class="whitespace-nowrap px-5 py-3 text-right font-semibold tabular text-ink">
									{formatPeso(row.netCentavos)}
								</td>
								<td class="whitespace-nowrap px-5 py-3">
									{#if row.status === 'Cancelled'}
										<span class="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
											<span class="h-1.5 w-1.5 rounded-full bg-danger" /> Cancelled
										</span>
									{:else}
										<span
											class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {row.paymentStatus ===
											'Paid'
												? 'bg-leaf-soft text-pine-700'
												: 'bg-warning/10 text-warning'}"
										>
											<span
												class="h-1.5 w-1.5 rounded-full {row.paymentStatus === 'Paid' ? 'bg-leaf' : 'bg-warning'}"
											/>
											{row.paymentStatus}
										</span>
									{/if}
								</td>
								<td class="whitespace-nowrap px-5 py-3">
									{#if row.status === 'Cancelled'}
										<span class="text-muted">—</span>
									{:else if (row.results ?? []).length}
										<span
											class="inline-flex items-center gap-1.5 rounded-full bg-leaf-soft px-2.5 py-1 text-xs font-medium text-pine-700"
											title={describeResults(row)}
										>
											<span class="h-1.5 w-1.5 rounded-full bg-leaf" />
											Result encoded{row.results.length > 1 ? ` (${row.results.length})` : ''}
										</span>
									{:else}
										<span class="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
											<span class="h-1.5 w-1.5 rounded-full bg-warning" /> Awaiting result
										</span>
									{/if}
								</td>
								<td class="whitespace-nowrap px-5 py-3 text-muted">{encoderName(row)}</td>
								<td class="px-5 py-3">
									<div class="flex items-center justify-end gap-2">
										<Button
											color="secondary"
											text="Slip"
											padding="py-1.5 px-3"
											textSize="text-xs"
											on:click={() => openSlip(row)}
										/>
										<!-- results are clinical: a cashier or manager reads the
										     column but is not offered the buttons -->
										{#if canEncode && $isOnline}
											{#if (row.results ?? []).length && row.patientId}
												<Button
													color="secondary"
													text={loadingResultId && row.results.some((r) => r._id === loadingResultId)
														? 'Opening…'
														: row.results.length > 1
															? `View results (${row.results.length})`
															: 'View result'}
													padding="py-1.5 px-3"
													textSize="text-xs"
													disabled={!!loadingResultId}
													on:click={() => viewResults(row)}
												/>
											{/if}
											{#if resultBlocker(row)}
												<span title={resultBlocker(row)}>
													<Button color="primary" text="Create result" padding="py-1.5 px-3" textSize="text-xs" disabled />
												</span>
											{:else}
												<Button
													color="primary"
													text="Create result"
													type="link"
													href="/record/create/{row.patientId}?transaction={row._id}"
													padding="py-1.5 px-3"
													textSize="text-xs"
												/>
											{/if}
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					{:else}
						<tr>
							<td colspan="9" class="px-5 py-14 text-center">
								<p class="font-display text-base font-semibold text-ink">
									{loadError ? 'Could not load transactions' : 'No transactions in this range'}
								</p>
								<p class="mt-1 text-sm text-muted">
									{loadError
										? loadError
										: search
										? 'Try a different reference number or name.'
										: 'Transactions encoded for these dates will appear here.'}
								</p>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Footer / pagination -->
		<div class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
			<div class="flex items-center gap-4 text-sm text-muted">
				<label class="flex items-center gap-2">
					Rows
					<input
						type="number"
						min="1"
						bind:value={pageSize}
						on:change={handleOverFlow}
						class="w-16 rounded-lg border-line bg-surface py-1 text-center text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
					/>
				</label>
				<span>
					<span class="font-mono font-semibold text-ink">{pageMinIndex}</span>–<span
						class="font-mono font-semibold text-ink">{pageMaxIndex}</span
					>
					of <span class="font-mono font-semibold text-ink">{itemSize}</span>
				</span>
			</div>
			<div class="inline-flex gap-1">
				<button
					on:click={decrementPageNumber}
					class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:opacity-40"
					disabled={pageMinIndex <= 1}
				>
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
						<path fill-rule="evenodd" d="M12.7 15.7a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 1.4L8.42 10l4.3 4.3a1 1 0 010 1.4z" clip-rule="evenodd" />
					</svg>
					Prev
				</button>
				<button
					on:click={incrementPageNumber}
					class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:opacity-40"
					disabled={pageMaxIndex >= itemSize}
				>
					Next
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
						<path fill-rule="evenodd" d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4l4.3-4.3-4.3-4.3a1 1 0 010-1.4z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>

{#if isViewModalOpen && currentTransaction}
	<LabReceiptModal bind:isViewModalOpen data={currentTransaction} />
{/if}

<svelte:window on:keydown={(e) => e.key === 'Escape' && pickingFrom && (pickingFrom = null)} />

{#if pickingFrom}
	<div class="fixed z-10 inset-0 overflow-y-auto">
		<div class="flex items-center justify-center min-h-screen p-4">
			<div class="fixed inset-0 bg-ink/40 backdrop-blur-sm" on:click={() => (pickingFrom = null)} />
			<div class="relative z-50 w-full max-w-md rounded-xl border border-line bg-surface shadow-card-lg">
				<div class="border-b border-line px-6 py-4">
					<h3 class="font-display text-lg font-bold text-ink">Results for {pickingFrom.referenceNumber}</h3>
					<p class="mt-1 text-sm text-muted">
						{pickingFrom.customer?.name || '—'} · {pickingFrom.results.length} results on this slip
					</p>
				</div>
				<ul class="divide-y divide-line">
					{#each pickingFrom.results as r (r._id)}
						<li>
							<button
								type="button"
								class="flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-paper disabled:opacity-60"
								disabled={!!loadingResultId}
								on:click={() => openResult(pickingFrom, r._id)}
							>
								<span class="{categoryBadgeBase} {categoryBadge(r.category).tint}">
									<span class="h-1.5 w-1.5 shrink-0 rounded-full {categoryBadge(r.category).dot}" />
									{r.category}
								</span>
								<span class="font-mono text-sm font-semibold text-ink">
									{r.caseNumber ? `Case ${r.caseNumber}` : 'Pending case no.'}
								</span>
								<span class="ml-auto font-mono text-xs text-muted">
									{loadingResultId === r._id ? 'Opening…' : dateTime(r.created)}
								</span>
							</button>
						</li>
					{/each}
				</ul>
				<div class="flex justify-end border-t border-line px-6 py-3">
					<Button color="secondary" text="Close" padding="py-1.5 px-3" textSize="text-xs" on:click={() => (pickingFrom = null)} />
				</div>
			</div>
		</div>
	</div>
{/if}

{#if isResultOpen && currentResult}
	{#if currentResult.category === 'Chemistry'}
		<ChemistryModal bind:isViewModalOpen={isResultOpen} data={currentResult} />
	{:else if currentResult.category === 'Hematology'}
		<HematologyModal bind:isViewModalOpen={isResultOpen} data={currentResult} />
	{:else if currentResult.category === 'Urinalysis'}
		<UrinalysisModal bind:isViewModalOpen={isResultOpen} data={currentResult} />
	{:else if currentResult.category === 'Parasitology'}
		<ParasitologyModal bind:isViewModalOpen={isResultOpen} data={currentResult} />
	{:else if currentResult.category === 'Miscellaneous'}
		<MiscModal bind:isViewModalOpen={isResultOpen} data={currentResult} />
	{/if}
{/if}
