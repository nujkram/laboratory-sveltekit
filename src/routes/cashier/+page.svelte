<script>
	// @ts-nocheck
	// Cashier counter. Scan or type the reference from the customer's charge
	// slip, check the tests and the total, take payment.
	//
	// A barcode/QR scanner is a keyboard wedge — it types the decoded string and
	// presses Enter — so the lookup field just needs to stay focused. There is no
	// scanner integration and no camera.
	//
	// Nothing about the charge is re-entered here: the tests and every amount
	// come from the stored transaction.
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import Button from '$lib/components/reusable/Button.svelte';
	import LabReceiptModal from '$lib/components/modals/LabReceiptModal.svelte';
	import { formatPeso, toCentavos } from '$lib/utils/currency';
	import { canTakePayment } from '$lib/common/utils';
	import { isOnline } from '$lib/stores/connectivity.js';

	let lookupEl;
	let lookup = '';
	let looking = false;
	let lookupError = '';

	let transaction = null;

	let orNumber = '';
	let method = 'Cash';
	let tenderedInput = '';
	let paying = false;
	let payError = '';
	let paidJustNow = false;

	let isViewModalOpen = false;

	$: allowed = canTakePayment($page.data.user);
	$: netCentavos = transaction?.netCentavos ?? 0;
	$: tenderedCentavos = method === 'Cash' ? toCentavos(tenderedInput) : netCentavos;
	$: changeCentavos =
		tenderedCentavos === null ? null : Math.max(0, tenderedCentavos - netCentavos);
	$: shortTendered = method === 'Cash' && tenderedCentavos !== null && tenderedCentavos < netCentavos;
	$: alreadyPaid = transaction?.paymentStatus === 'Paid';
	$: cancelled = transaction?.status === 'Cancelled';
	$: canPay =
		!paying &&
		$isOnline &&
		allowed &&
		!!transaction &&
		!alreadyPaid &&
		!cancelled &&
		!!orNumber.trim() &&
		!shortTendered &&
		(method !== 'Cash' || tenderedCentavos !== null);

	// A scanner ends its burst with Enter. The form's submit button would
	// normally handle that implicitly, but this is the one interaction the whole
	// counter depends on, so it is wired explicitly rather than left to it.
	function handleKey(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			retrieve();
		}
	}

	async function retrieve() {
		const reference = lookup.trim();
		if (!reference || looking) return;
		looking = true;
		lookupError = '';
		payError = '';
		paidJustNow = false;
		transaction = null;

		try {
			const res = await fetch(`/api/admin/lab-transaction/by-reference/${encodeURIComponent(reference)}`, {
				credentials: 'include'
			});
			const result = await res.json();
			if (result?.status === 'Success') {
				transaction = result.response;
				orNumber = transaction?.payment?.orNumber ?? '';
				tenderedInput = '';
				method = transaction?.payment?.method ?? 'Cash';
			} else {
				lookupError = result?.message || 'Could not retrieve that transaction.';
			}
		} catch {
			lookupError = $isOnline
				? 'Could not reach the server.'
				: 'You are offline. Payments can only be taken online.';
		} finally {
			looking = false;
			await tick();
			selectLookup();
		}
	}

	async function takePayment() {
		if (!canPay) return;
		paying = true;
		payError = '';

		try {
			const res = await fetch('/api/admin/lab-transaction/pay', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					_id: transaction._id,
					orNumber: orNumber.trim(),
					method,
					amountTenderedCentavos: method === 'Cash' ? tenderedCentavos : undefined
				})
			});
			const result = await res.json();
			if (result?.status === 'Success') {
				transaction = { ...transaction, ...result.response };
				paidJustNow = true;
			} else {
				// A 409 here is the double-charge guard doing its job — show exactly
				// what the server said, and refresh so the cashier sees the truth.
				payError = result?.message || 'Payment could not be recorded.';
				if (result?.response) transaction = result.response;
			}
		} catch {
			payError = 'Could not reach the server. The payment was NOT recorded.';
		} finally {
			paying = false;
		}
	}

	function nextCustomer() {
		transaction = null;
		lookup = '';
		orNumber = '';
		tenderedInput = '';
		method = 'Cash';
		payError = '';
		lookupError = '';
		paidJustNow = false;
		selectLookup();
	}

	function selectLookup() {
		lookupEl?.focus();
		lookupEl?.select();
	}

	onMount(selectLookup);
</script>

<div class="animate-rise-in mx-auto max-w-4xl space-y-5">
	<div>
		<h2 class="font-display text-2xl font-bold text-ink">Cashier</h2>
		<p class="mt-1 text-sm text-muted">
			Scan the charge slip or type its reference number, then take payment.
		</p>
	</div>

	{#if !allowed}
		<div
			class="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
			role="alert"
		>
			Your account is not a cashier or administrator, so you can look transactions up but not take
			payment.
		</div>
	{/if}

	{#if !$isOnline}
		<div
			class="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning"
			role="alert"
		>
			You are offline. Payments need the server to guarantee a transaction is charged only once, so
			they cannot be taken until the connection is back.
		</div>
	{/if}

	<!-- Lookup -->
	<form
		class="overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-card"
		on:submit|preventDefault={retrieve}
	>
		<label class="mb-1.5 block text-sm font-medium text-ink" for="lookup">Reference number</label>
		<div class="flex gap-2">
			<input
				id="lookup"
				bind:this={lookupEl}
				bind:value={lookup}
				class="field flex-1 font-mono text-lg"
				type="text"
				autocomplete="off"
				spellcheck="false"
				placeholder="Scan the slip, or type LT-000123"
				on:keydown={handleKey}
			/>
			<Button
				color="primary"
				text={looking ? 'Finding…' : 'Retrieve'}
				disabled={looking || !lookup.trim()}
				padding="py-2.5 px-5"
			/>
		</div>
		<p class="field-hint">A scanner types the code and presses Enter — just leave this field focused.</p>
		{#if lookupError}
			<p class="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger" role="alert">
				{lookupError}
			</p>
		{/if}
	</form>

	{#if transaction}
		<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
			<!-- Header -->
			<div class="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
				<div>
					<p class="font-mono text-xl font-bold text-ink">{transaction.referenceNumber}</p>
					<p class="mt-0.5 font-medium text-ink">{transaction.customer?.name}</p>
					<p class="text-xs text-muted">
						{transaction.customer?.sex || '—'}
						{transaction.customer?.age != null ? ` · ${transaction.customer.age} yrs` : ''}
						{transaction.requestedBy ? ` · Requested by ${transaction.requestedBy}` : ''}
					</p>
				</div>
				{#if cancelled}
					<span class="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-sm font-medium text-danger">
						<span class="h-1.5 w-1.5 rounded-full bg-danger" /> Cancelled
					</span>
				{:else}
					<span
						class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium {alreadyPaid
							? 'bg-leaf-soft text-pine-700'
							: 'bg-warning/10 text-warning'}"
					>
						<span class="h-1.5 w-1.5 rounded-full {alreadyPaid ? 'bg-leaf' : 'bg-warning'}" />
						{transaction.paymentStatus}
					</span>
				{/if}
			</div>

			<!-- Charges, straight from the stored transaction -->
			<table class="w-full text-sm">
				<thead class="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-muted">
					<tr>
						<th class="px-5 py-2 font-semibold">Code</th>
						<th class="px-5 py-2 font-semibold">Laboratory test</th>
						<th class="px-5 py-2 text-center font-semibold">Qty</th>
						<th class="px-5 py-2 text-right font-semibold">Charge</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-line">
					{#each transaction.items ?? [] as item (item.code)}
						<tr>
							<td class="px-5 py-2 font-mono text-xs text-muted">{item.code}</td>
							<td class="px-5 py-2 text-ink">{item.name}</td>
							<td class="px-5 py-2 text-center text-muted">{item.qty}</td>
							<td class="px-5 py-2 text-right tabular text-ink">{formatPeso(item.lineTotalCentavos)}</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<div class="flex justify-end border-t border-line px-5 py-4">
				<div class="w-full sm:w-72">
					<div class="flex justify-between py-1 text-sm text-muted">
						<span>Subtotal</span>
						<span class="tabular font-semibold text-ink">{formatPeso(transaction.grossCentavos)}</span>
					</div>
					<div class="flex justify-between py-1 text-sm text-muted">
						<span>Discount{transaction.discountReason ? ` (${transaction.discountReason})` : ''}</span>
						<span class="tabular font-semibold text-ink">{formatPeso(transaction.discountCentavos)}</span>
					</div>
					<div class="mt-1 flex items-baseline justify-between border-t border-line pt-2">
						<span class="font-medium text-ink">Total due</span>
						<span class="font-display text-2xl font-bold tabular text-pine-700">
							{formatPeso(transaction.netCentavos)}
						</span>
					</div>
				</div>
			</div>

			<!-- Payment -->
			{#if alreadyPaid}
				<div class="border-t border-line bg-leaf-soft/50 px-5 py-4">
					<p class="text-sm font-medium text-pine-700">
						Paid under O.R. {transaction.payment?.orNumber}
						{transaction.payment?.paidByName ? ` by ${transaction.payment.paidByName}` : ''}
						{transaction.payment?.paidAt
							? ` on ${new Date(transaction.payment.paidAt).toLocaleString()}`
							: ''}.
					</p>
					{#if transaction.payment?.changeCentavos}
						<p class="mt-0.5 text-xs text-muted">
							Tendered {formatPeso(transaction.payment.amountTenderedCentavos)} · change
							{formatPeso(transaction.payment.changeCentavos)}
						</p>
					{/if}
					<div class="mt-3 flex flex-wrap gap-2">
						<Button color="primary" text="Print receipt" on:click={() => (isViewModalOpen = true)} />
						<Button color="secondary" text="Next customer" on:click={nextCustomer} />
					</div>
				</div>
			{:else if cancelled}
				<div class="border-t border-line px-5 py-4">
					<p class="text-sm font-medium text-danger">
						This transaction was cancelled{transaction.cancelReason
							? ` — ${transaction.cancelReason}`
							: ''}. It cannot be paid.
					</p>
					<div class="mt-3">
						<Button color="secondary" text="Next customer" on:click={nextCustomer} />
					</div>
				</div>
			{:else}
				<div class="space-y-4 border-t border-line px-5 py-4">
					<div class="grid gap-3 sm:grid-cols-3">
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink" for="orNumber">
								O.R. number
							</label>
							<input
								id="orNumber"
								class="field font-mono"
								type="text"
								bind:value={orNumber}
								autocomplete="off"
								placeholder="From the receipt booklet"
							/>
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink" for="method">Method</label>
							<select id="method" class="field" bind:value={method}>
								<option value="Cash">Cash</option>
								<option value="Card">Card</option>
								<option value="GCash">GCash</option>
								<option value="Cheque">Cheque</option>
							</select>
						</div>
						{#if method === 'Cash'}
							<div>
								<label class="mb-1.5 block text-sm font-medium text-ink" for="tendered">
									Amount tendered (₱)
								</label>
								<input
									id="tendered"
									class="field"
									type="text"
									inputmode="decimal"
									bind:value={tenderedInput}
									placeholder={formatPeso(netCentavos).replace('₱', '')}
								/>
								{#if shortTendered}
									<p class="mt-1 text-xs font-medium text-danger">Less than the total due.</p>
								{/if}
							</div>
						{/if}
					</div>

					{#if method === 'Cash' && changeCentavos !== null && !shortTendered && tenderedInput.trim()}
						<p class="text-sm text-muted">
							Change: <span class="tabular font-display text-lg font-bold text-ink">
								{formatPeso(changeCentavos)}
							</span>
						</p>
					{/if}

					{#if payError}
						<p class="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger" role="alert">
							{payError}
						</p>
					{/if}

					<div class="flex items-center justify-end gap-3">
						<Button color="secondary" text="Cancel" on:click={nextCustomer} />
						<Button
							color="success"
							text={paying ? 'Recording…' : `Take payment ${formatPeso(netCentavos)}`}
							disabled={!canPay}
							padding="py-2.5 px-5"
							on:click={takePayment}
						/>
					</div>
				</div>
			{/if}
		</div>

		{#if paidJustNow}
			<p class="text-center text-sm font-medium text-pine-700">
				Payment recorded. Print the receipt for the customer.
			</p>
		{/if}
	{/if}
</div>

{#if isViewModalOpen && transaction}
	<LabReceiptModal bind:isViewModalOpen data={transaction} />
{/if}
