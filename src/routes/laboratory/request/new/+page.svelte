<script>
	// @ts-nocheck
	// Encode a laboratory request and turn it into a priced transaction.
	//
	// Deliberately NOT offline-capable (no saveOrQueue): the reference number is
	// allocated by the server and printed on a slip the customer carries to the
	// cashier, so it can only ever be a number that really exists. When offline
	// the form says so rather than queueing something unprintable.
	//
	// Totals shown here are a preview for the encoder. The server recomputes
	// every amount from the catalog on submit — that is the authoritative one.
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Button from '$lib/components/reusable/Button.svelte';
	import DiscountFields from '$lib/components/reusable/DiscountFields.svelte';
	import LabReceiptModal from '$lib/components/modals/LabReceiptModal.svelte';
	import { id } from '$lib/common/utils';
	import { formatPeso, toCentavos } from '$lib/utils/currency';
	import { discountLineLabel, emptyDiscountForm } from '$lib/common/discounts';
	import { isOnline } from '$lib/stores/connectivity.js';

	let tests = [];
	let sections = [];
	let patients = [];
	let loading = true;
	let loadError = '';

	let mode = 'patient';
	let patientSearch = '';
	let selectedPatient = null;

	let walkIn = { name: '', age: '', sex: '', address: '' };
	let requestedBy = '';
	let remarks = '';

	/** code -> qty */
	let selected = {};
	let testSearch = '';
	let openSection = '';

	let discount = emptyDiscountForm();
	let discountResult = null;

	let submitting = false;
	let message = null;
	let messageTone = 'muted';

	let isViewModalOpen = false;
	let createdTransaction = null;

	$: selectedCodes = Object.keys(selected).map(Number);
	$: selectedLines = selectedCodes
		.map((code) => {
			const test = tests.find((t) => t.code === code);
			if (!test) return null;
			return { ...test, qty: selected[code], lineTotalCentavos: test.priceCentavos * selected[code] };
		})
		.filter(Boolean)
		.sort((a, b) => a.code - b.code);

	$: grossCentavos = selectedLines.reduce((sum, line) => sum + line.lineTotalCentavos, 0);
	// `discountResult` is bound from DiscountFields, which runs the same
	// resolveDiscount the server will. An invalid discount previews as zero and
	// blocks submit, rather than showing a total the server would refuse.
	$: discountCentavos = discountResult?.ok ? discountResult.value.discountCentavos : 0;
	$: netCentavos = Math.max(0, grossCentavos - discountCentavos);
	$: customerAge = mode === 'patient' ? selectedPatient?.age ?? null : walkIn.age;

	$: patientMatches = patientSearch.trim()
		? patients
				.filter((p) =>
					(p.completeName ?? '').toLowerCase().includes(patientSearch.trim().toLowerCase())
				)
				.slice(0, 8)
		: [];

	$: visibleTests = testSearch.trim()
		? tests.filter((t) => {
				const term = testSearch.trim().toLowerCase();
				return t.name.toLowerCase().includes(term) || String(t.code).includes(term);
		  })
		: tests;

	$: groupedTests = sections
		.map((section) => ({ section, rows: visibleTests.filter((t) => t.section === section) }))
		.filter((group) => group.rows.length);

	$: canSubmit =
		!submitting &&
		$isOnline &&
		selectedLines.length > 0 &&
		!!discountResult?.ok &&
		(mode === 'patient' ? !!selectedPatient : !!walkIn.name.trim());

	onMount(async () => {
		try {
			const [catalogRes, patientRes] = await Promise.all([
				fetch('/api/admin/lab-test', { credentials: 'include' }),
				fetch('/api/admin/patient', { credentials: 'include' })
			]);
			const catalog = await catalogRes.json();
			const patientList = await patientRes.json();

			if (catalog?.status === 'Success') {
				tests = catalog.response ?? [];
				sections = catalog.sections ?? [];
				openSection = sections[0] ?? '';
			} else {
				loadError = catalog?.message || 'Could not load the laboratory test catalog.';
			}
			patients = patientList?.response ?? patientList ?? [];
			if (!Array.isArray(patients)) patients = [];
		} catch {
			loadError = $isOnline
				? 'Could not load the laboratory test catalog.'
				: 'You are offline. Laboratory requests can only be encoded online.';
		} finally {
			loading = false;
		}
	});

	function toggleTest(test) {
		if (test.isAvailable === false) return;
		if (selected[test.code]) {
			const next = { ...selected };
			delete next[test.code];
			selected = next;
		} else {
			selected = { ...selected, [test.code]: 1 };
		}
	}

	function setQty(code, qty) {
		const value = Math.min(99, Math.max(1, parseInt(qty, 10) || 1));
		selected = { ...selected, [code]: value };
	}

	function removeLine(code) {
		const next = { ...selected };
		delete next[code];
		selected = next;
	}

	function pickPatient(patient) {
		selectedPatient = patient;
		patientSearch = '';
	}

	function clearPatient() {
		selectedPatient = null;
	}

	async function handleSubmit() {
		if (!canSubmit) return;
		submitting = true;
		messageTone = 'muted';
		message = 'Creating transaction…';

		const body = {
			_id: id(),
			patientId: mode === 'patient' ? selectedPatient?._id : null,
			customer:
				mode === 'patient'
					? undefined
					: {
							name: walkIn.name.trim(),
							age: walkIn.age,
							sex: walkIn.sex,
							address: walkIn.address.trim()
					  },
			requestedBy: requestedBy.trim(),
			items: selectedLines.map((line) => ({ code: line.code, qty: line.qty })),
			// Send what was chosen, not what it comes to: the server computes a
			// statutory amount itself and ignores any figure posted alongside it.
			discount: {
				type: discount.type,
				idNumber: discount.idNumber.trim(),
				cardholderName: discount.cardholderName.trim(),
				amountCentavos: toCentavos(discount.amountInput) ?? 0,
				reason: discount.reason.trim()
			},
			remarks: remarks.trim()
		};

		try {
			const res = await fetch('/api/admin/lab-transaction/insert', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body)
			});
			const result = await res.json();
			if (result?.status === 'Success') {
				createdTransaction = result.response;
				message = `Transaction ${result.response.referenceNumber} created.`;
				messageTone = 'pine-700';
				isViewModalOpen = true;
			} else {
				message = result?.message || 'Could not create the transaction.';
				messageTone = 'danger';
				submitting = false;
			}
		} catch {
			message = 'Could not reach the server. The transaction was not created.';
			messageTone = 'danger';
			submitting = false;
		}
	}

	function startAnother() {
		selected = {};
		selectedPatient = null;
		walkIn = { name: '', age: '', sex: '', address: '' };
		requestedBy = '';
		remarks = '';
		discount = emptyDiscountForm();
		createdTransaction = null;
		message = null;
		submitting = false;
	}
</script>

<div class="animate-rise-in mx-auto max-w-5xl space-y-5">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-display text-2xl font-bold text-ink">New laboratory request</h2>
			<p class="mt-1 text-sm text-muted">
				Encode the patient and the tests required. Charges come from the laboratory catalog.
			</p>
		</div>
		<Button type="link" href="/laboratory/transactions" color="secondary" text="All transactions" />
	</div>

	{#if !$isOnline}
		<div
			class="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning"
			role="alert"
		>
			You are offline. A laboratory request needs a server-issued reference number, so it cannot be
			encoded until the connection is back. Patient and result entry still work offline.
		</div>
	{/if}

	{#if loadError}
		<div
			class="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
			role="alert"
		>
			{loadError}
		</div>
	{/if}

	{#if createdTransaction}
		<div class="rounded-xl border border-line bg-surface p-5 shadow-card">
			<p class="font-display text-lg font-bold text-ink">
				Transaction {createdTransaction.referenceNumber} created
			</p>
			<p class="mt-1 text-sm text-muted">
				{formatPeso(createdTransaction.netCentavos)} · {createdTransaction.items.length} test{createdTransaction
					.items.length === 1
					? ''
					: 's'} · give the slip to the customer for the cashier.
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<Button color="primary" text="Print slip" on:click={() => (isViewModalOpen = true)} />
				<Button color="secondary" text="Encode another request" on:click={startAnother} />
				<Button type="link" href="/laboratory/transactions" color="terciary" text="View transactions" />
			</div>
		</div>
	{:else}
		<!-- Who -->
		<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
			<div class="border-b border-line px-5 py-3">
				<h3 class="font-display text-base font-bold text-ink">Patient / customer</h3>
			</div>
			<div class="space-y-4 px-5 py-4">
				<div class="inline-flex rounded-lg border border-line p-0.5">
					{#each [['patient', 'Registered patient'], ['walkin', 'Walk-in customer']] as [value, label]}
						<button
							type="button"
							on:click={() => (mode = value)}
							class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {mode === value
								? 'bg-primary text-white'
								: 'text-muted hover:bg-paper'}"
						>
							{label}
						</button>
					{/each}
				</div>

				{#if mode === 'patient'}
					{#if selectedPatient}
						<div class="flex items-center justify-between rounded-lg border border-line bg-paper px-4 py-3">
							<div>
								<p class="font-medium text-ink">{selectedPatient.completeName}</p>
								<p class="text-xs text-muted">
									{selectedPatient.gender || '—'}{selectedPatient.address ? ` · ${selectedPatient.address}` : ''}
								</p>
							</div>
							<button
								type="button"
								on:click={clearPatient}
								class="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper"
							>
								Change
							</button>
						</div>
					{:else}
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink" for="patientSearch">
								Search patients
							</label>
							<input
								id="patientSearch"
								class="field"
								type="search"
								bind:value={patientSearch}
								placeholder="Type a surname…"
								autocomplete="off"
							/>
							{#if patientMatches.length}
								<ul class="mt-2 divide-y divide-line rounded-lg border border-line">
									{#each patientMatches as patient (patient._id)}
										<li>
											<button
												type="button"
												on:click={() => pickPatient(patient)}
												class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-paper"
											>
												<span class="font-medium text-ink">{patient.completeName}</span>
												<span class="text-xs text-muted">{patient.gender || ''}</span>
											</button>
										</li>
									{/each}
								</ul>
							{:else if patientSearch.trim()}
								<p class="field-hint">
									No patient matches that. Use <strong>Walk-in customer</strong> if they are not registered.
								</p>
							{/if}
						</div>
					{/if}
				{:else}
					<div class="grid gap-3 sm:grid-cols-2">
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink" for="walkName">Name</label>
							<input id="walkName" class="field" type="text" bind:value={walkIn.name} required />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink" for="walkAddress">Address</label>
							<input id="walkAddress" class="field" type="text" bind:value={walkIn.address} />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink" for="walkAge">Age</label>
							<input id="walkAge" class="field" type="number" min="0" max="130" bind:value={walkIn.age} />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-ink" for="walkSex">Sex</label>
							<select id="walkSex" class="field" bind:value={walkIn.sex}>
								<option value="">—</option>
								<option value="Male">Male</option>
								<option value="Female">Female</option>
							</select>
						</div>
					</div>
				{/if}

				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label class="mb-1.5 block text-sm font-medium text-ink" for="requestedBy">
							Requesting physician
						</label>
						<input
							id="requestedBy"
							class="field"
							type="text"
							bind:value={requestedBy}
							placeholder="e.g. DR. SANTOS"
						/>
					</div>
					<div>
						<label class="mb-1.5 block text-sm font-medium text-ink" for="remarks">Remarks</label>
						<input id="remarks" class="field" type="text" bind:value={remarks} />
					</div>
				</div>
			</div>
		</div>

		<!-- Tests -->
		<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
			<div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
				<h3 class="font-display text-base font-bold text-ink">Laboratory tests</h3>
				<input
					class="field max-w-xs"
					type="search"
					bind:value={testSearch}
					placeholder="Search code or test name…"
				/>
			</div>

			{#if loading}
				<p class="px-5 py-10 text-center text-sm text-muted">Loading catalog…</p>
			{:else}
				<div class="max-h-96 overflow-y-auto px-5 py-3">
					{#each groupedTests as group (group.section)}
						<div class="mb-4">
							<h4 class="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
								{group.section}
							</h4>
							<div class="grid gap-1.5 sm:grid-cols-2">
								{#each group.rows as test (test.code)}
									<label
										class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors {test.isAvailable ===
										false
											? 'cursor-not-allowed border-line bg-paper opacity-50'
											: selected[test.code]
											? 'cursor-pointer border-leaf bg-leaf-soft'
											: 'cursor-pointer border-line hover:bg-paper'}"
									>
										<input
											type="checkbox"
											class="rounded border-line text-leaf focus:ring-2 focus:ring-leaf/25"
											checked={!!selected[test.code]}
											disabled={test.isAvailable === false}
											on:change={() => toggleTest(test)}
										/>
										<span class="font-mono text-xs text-muted">{test.code}</span>
										<span class="flex-1 text-ink">{test.name}</span>
										<span class="tabular text-xs font-semibold text-muted">
											{test.isAvailable === false ? 'n/a' : formatPeso(test.priceCentavos)}
										</span>
									</label>
								{/each}
							</div>
						</div>
					{:else}
						<p class="py-8 text-center text-sm text-muted">No test matches “{testSearch}”.</p>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Selected + totals -->
		<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
			<div class="border-b border-line px-5 py-3">
				<h3 class="font-display text-base font-bold text-ink">
					Selected tests
					<span class="ml-1 font-sans text-sm font-normal text-muted">({selectedLines.length})</span>
				</h3>
			</div>

			{#if selectedLines.length}
				<table class="w-full text-sm">
					<thead class="border-b border-line bg-paper text-left text-xs uppercase tracking-wide text-muted">
						<tr>
							<th class="px-5 py-2 font-semibold">Code</th>
							<th class="px-5 py-2 font-semibold">Test</th>
							<th class="px-5 py-2 font-semibold">Qty</th>
							<th class="px-5 py-2 text-right font-semibold">Price</th>
							<th class="px-5 py-2 text-right font-semibold">Amount</th>
							<th class="px-5 py-2" />
						</tr>
					</thead>
					<tbody class="divide-y divide-line">
						{#each selectedLines as line (line.code)}
							<tr>
								<td class="px-5 py-2 font-mono text-xs text-muted">{line.code}</td>
								<td class="px-5 py-2 text-ink">{line.name}</td>
								<td class="px-5 py-2">
									<input
										type="number"
										min="1"
										max="99"
										value={line.qty}
										on:change={(e) => setQty(line.code, e.currentTarget.value)}
										class="w-16 rounded-lg border-line bg-surface py-1 text-center text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
									/>
								</td>
								<td class="px-5 py-2 text-right tabular text-muted">{formatPeso(line.priceCentavos)}</td>
								<td class="px-5 py-2 text-right tabular font-semibold text-ink">
									{formatPeso(line.lineTotalCentavos)}
								</td>
								<td class="px-5 py-2 text-right">
									<button
										type="button"
										on:click={() => removeLine(line.code)}
										class="rounded-lg border border-line bg-surface px-2 py-1 text-xs font-medium text-danger transition-colors hover:bg-paper"
									>
										Remove
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<p class="px-5 py-10 text-center text-sm text-muted">
					No tests selected yet. Pick them from the list above.
				</p>
			{/if}

			<div class="flex flex-wrap items-start justify-between gap-6 border-t border-line px-5 py-4">
				<div class="flex-1" style="min-width: 16rem">
					<DiscountFields
						bind:discount
						bind:result={discountResult}
						{grossCentavos}
						{customerAge}
					/>
				</div>

				<div class="w-full sm:w-64">
					<div class="flex justify-between py-1 text-sm text-muted">
						<span>Gross amount</span><span class="tabular font-semibold text-ink">{formatPeso(grossCentavos)}</span>
					</div>
					<div class="flex justify-between gap-3 py-1 text-sm text-muted">
						<span>{discountLineLabel(discount.type)}</span><span class="tabular font-semibold text-ink">{formatPeso(discountCentavos)}</span>
					</div>
					<div class="mt-1 flex justify-between border-t border-line pt-2">
						<span class="font-medium text-ink">Net amount</span>
						<span class="font-display text-lg font-bold tabular text-pine-700">{formatPeso(netCentavos)}</span>
					</div>
				</div>
			</div>

			<div class="flex items-center justify-end gap-3 border-t border-line px-5 py-4">
				{#if message}
					<!-- full class strings, not interpolated: Tailwind's JIT only keeps
					     classes it can see literally in the source -->
					<span
						transition:fade
						class="text-sm font-medium {messageTone === 'danger'
							? 'text-danger'
							: messageTone === 'pine-700'
							? 'text-pine-700'
							: 'text-muted'}"
					>
						{message}
					</span>
				{/if}
				<Button
					color="primary"
					text={submitting ? 'Creating…' : 'Create transaction'}
					disabled={!canSubmit}
					padding="py-2.5 px-5"
					on:click={handleSubmit}
				/>
			</div>
		</div>
	{/if}
</div>

{#if isViewModalOpen && createdTransaction}
	<LabReceiptModal bind:isViewModalOpen data={createdTransaction} />
{/if}
