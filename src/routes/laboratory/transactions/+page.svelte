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
	import { formatPeso } from '$lib/utils/currency';
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
	let mineOnly = false;

	let fromDate = todayLocal();
	let toDate = todayLocal();

	let isViewModalOpen = false;
	let currentTransaction = null;

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
				<input
					type="search"
					bind:value={search}
					on:input={handleSearch}
					placeholder="Search reference, name or doctor…"
					class="w-full rounded-lg border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 focus:border-leaf focus:ring-2 focus:ring-leaf/25"
				/>
			</div>
		</div>

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
						<th scope="col" class="px-5 py-3 font-semibold">Encoded by</th>
						<th scope="col" class="px-5 py-3 text-right font-semibold">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-line">
					{#if loading}
						<tr>
							<td colspan="8" class="px-5 py-14 text-center">
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
									</div>
								</td>
							</tr>
						{/each}
					{:else}
						<tr>
							<td colspan="8" class="px-5 py-14 text-center">
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
