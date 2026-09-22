<script>
	// @ts-nocheck
	// The discount controls, shared by the request form and the cashier counter.
	//
	// Both screens must ask for exactly the same things, because the ID number and
	// the cardholder name are what the BIR looks for on the printed slip. Two
	// hand-maintained copies of these fields would drift, and the one that drifted
	// would be the one that stopped being deductible.
	//
	// No validation lives here. `resolveDiscount` is the same function the server
	// runs on submit, so what this component shows and what the server commits can
	// never disagree.
	import { formatPeso, toCentavos } from '$lib/utils/currency';
	import {
		DISCOUNT_TYPES,
		discountIdLabel,
		discountTypeLabel,
		emptyDiscountForm,
		isStatutory,
		resolveDiscount,
		statutoryDiscountCentavos,
		STATUTORY_DISCOUNT_PERCENT
	} from '$lib/common/discounts';

	/** @type {import('$lib/common/discounts').DiscountForm} */
	export let discount = emptyDiscountForm();
	export let grossCentavos = 0;
	export let disabled = false;
	/** Read by the parent: the same DiscountResult the server will produce. */
	export let result = null;
	/** Shown as a gentle nudge only — see the age note below. */
	export let customerAge = null;

	$: result = resolveDiscount(grossCentavos, {
		type: discount.type,
		idNumber: discount.idNumber,
		cardholderName: discount.cardholderName,
		amountCentavos: toCentavos(discount.amountInput) ?? 0,
		reason: discount.reason
	});

	$: statutory = isStatutory(discount.type);
	// Computed from the gross, NOT read off `result` — the 20% does not depend on
	// the ID being typed yet, and showing zero while the encoder is still filling
	// the card details reads as "this discount is worth nothing".
	$: statutoryCentavos = statutoryDiscountCentavos(grossCentavos);

	// A senior discount on a 34-year-old is worth mentioning, never blocking: the
	// ID governs, a walk-in's age is hand-typed and often blank, and a PWD
	// discount has no relationship to age at all.
	// `> 0` rather than isFinite: a walk-in's age is often blank, and Number('')
	// is 0, which would otherwise warn about every customer whose age was left
	// empty — including "recorded as ." with nothing to show.
	$: ageMismatch =
		discount.type === 'Senior' && Number(customerAge) > 0 && Number(customerAge) < 60;

	// Keyed by field, and reactive on purpose. A helper function called from the
	// markup would not be: Svelte tracks the identifiers in an expression, so
	// `errorFor('idNumber')` only depends on `errorFor` — which never changes —
	// and the message would stay on screen after the encoder fixed the field.
	$: errors = result && !result.ok ? { [result.field]: result.message } : {};
</script>

<div class="space-y-3">
	<div>
		<span class="mb-1.5 block text-sm font-medium text-ink">Discount</span>
		<div class="inline-flex flex-wrap rounded-lg border border-line p-0.5">
			{#each DISCOUNT_TYPES as value}
				<button
					type="button"
					{disabled}
					on:click={() => (discount.type = value)}
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 {discount.type ===
					value
						? 'bg-primary text-white'
						: 'text-muted hover:bg-paper'}"
				>
					{discountTypeLabel(value)}
				</button>
			{/each}
		</div>
	</div>

	{#if statutory}
		<div class="grid gap-3 sm:grid-cols-2">
			<div>
				<label class="mb-1.5 block text-sm font-medium text-ink" for="discountId">
					{discountIdLabel(discount.type)}
				</label>
				<input
					id="discountId"
					class="field font-mono"
					type="text"
					{disabled}
					bind:value={discount.idNumber}
					placeholder="12-3456"
				/>
				{#if errors.idNumber}
					<p class="mt-1 text-xs font-medium text-danger">{errors.idNumber}</p>
				{/if}
			</div>
			<div>
				<label class="mb-1.5 block text-sm font-medium text-ink" for="discountName">
					Name on the ID
				</label>
				<input
					id="discountName"
					class="field"
					type="text"
					{disabled}
					bind:value={discount.cardholderName}
					placeholder="Juan Dela Cruz"
				/>
				{#if errors.cardholderName}
					<p class="mt-1 text-xs font-medium text-danger">{errors.cardholderName}</p>
				{/if}
			</div>
		</div>

		<p class="text-xs text-muted">
			Copy both exactly as printed on the card. The BIR needs them on the slip for the
			{STATUTORY_DISCOUNT_PERCENT}% to be deductible, and the customer signs for it.
		</p>

		{#if ageMismatch}
			<p class="text-xs font-medium text-warning">
				This customer is recorded as {customerAge}. Check the card before continuing.
			</p>
		{/if}

		<!-- There is nothing to type: the amount is computed here and recomputed on
		     the server, and a typed figure would only be a chance to disagree. -->
		<div class="rounded-lg border border-line bg-paper px-4 py-2.5 text-sm">
			<span class="text-muted">
				{STATUTORY_DISCOUNT_PERCENT}% of {formatPeso(grossCentavos)} =
			</span>
			<span class="tabular font-semibold text-ink">{formatPeso(statutoryCentavos)}</span>
		</div>
	{:else if discount.type === 'Other'}
		<div class="grid gap-3 sm:grid-cols-2">
			<div>
				<label class="mb-1.5 block text-sm font-medium text-ink" for="discountAmount">
					Amount (₱)
				</label>
				<input
					id="discountAmount"
					class="field"
					type="text"
					inputmode="decimal"
					{disabled}
					bind:value={discount.amountInput}
					placeholder="0.00"
				/>
				{#if errors.amount}
					<p class="mt-1 text-xs font-medium text-danger">{errors.amount}</p>
				{/if}
			</div>
			<div>
				<label class="mb-1.5 block text-sm font-medium text-ink" for="discountReason">Reason</label>
				<input
					id="discountReason"
					class="field"
					type="text"
					{disabled}
					bind:value={discount.reason}
					placeholder="Company account, charity case"
				/>
				{#if errors.reason}
					<p class="mt-1 text-xs font-medium text-danger">{errors.reason}</p>
				{/if}
			</div>
		</div>
		<p class="text-xs text-muted">
			An ad-hoc concession. Your name and the reason are recorded against the transaction.
		</p>
	{/if}
</div>
