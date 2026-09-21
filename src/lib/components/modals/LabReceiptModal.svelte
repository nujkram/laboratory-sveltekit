<script>
	// @ts-nocheck
	// The laboratory charge slip the customer carries to the cashier.
	//
	// It prints BOTH a Code 128 barcode and a QR code of the same reference:
	// the cheap 1D laser scanners on most cashier counters cannot read a QR,
	// while a QR can be read by any phone. Both decode to the identical string,
	// and because scanners are keyboard wedges the cashier screen just receives
	// it as typed text.
	//
	// Both are rendered as SVG, never canvas — canvas rasterises at screen DPI
	// and prints soft, and app.css's print-color-adjust:exact already preserves
	// SVG fills.
	import { onMount } from 'svelte';
	import ReportModal from '$lib/components/report/ReportModal.svelte';
	import ReportHeader from '$lib/components/report/ReportHeader.svelte';
	import { formatAmount } from '$lib/utils/currency';
	import { formatDateMDY } from '$lib/utils/dateHelper.js';

	export let isViewModalOpen = false;
	export let data;

	let barcodeEl;
	let qrMarkup = '';
	let codeError = '';
	// The two generators are fetched on demand, so on a cold cache there is a
	// moment where the slip has a reference but no codes. Say so, otherwise
	// someone prints in that window and hands over a slip the cashier's scanner
	// cannot read.
	let codesReady = false;

	$: reference = data?.referenceNumber ?? '';
	$: encodedBy =
		data?.createdBy?.profile?.firstName || data?.createdBy?.name || data?.createdBy?.email || '';

	// Redraw whenever the modal opens with a different transaction.
	$: if (isViewModalOpen && reference) renderCodes(reference);

	async function renderCodes(value) {
		codeError = '';
		codesReady = false;
		try {
			// Loaded on demand so neither library sits in the main bundle — the
			// receipt is the only screen that needs them.
			const [{ default: JsBarcode }, QRCode] = await Promise.all([
				import('jsbarcode'),
				import('qrcode')
			]);

			qrMarkup = await QRCode.toString(value, {
				type: 'svg',
				errorCorrectionLevel: 'M',
				margin: 0
			});

			await tickThen(() => {
				if (!barcodeEl) return;
				JsBarcode(barcodeEl, value, {
					format: 'CODE128',
					displayValue: false,
					// Code 128 needs a quiet zone of at least 10 narrow modules either
					// side or a scanner cannot find the symbol's edges. `width` is the
					// module width, so 10 x 1.6 = 16 is the floor; 20 leaves margin for
					// the printer. Vertical margin stays 0 — only the horizontal
					// quiet zone matters.
					margin: 0,
					marginLeft: 20,
					marginRight: 20,
					width: 1.6,
					height: 44,
					background: 'transparent',
					lineColor: '#000000'
				});
			});
			codesReady = true;
		} catch (error) {
			// A receipt without a code is still a valid receipt — the reference is
			// printed in large type right beside it and can be keyed by hand.
			codeError = 'Code could not be generated — key the reference in manually.';
			console.error('receipt code generation failed:', error);
		}
	}

	// The <svg> only exists once the {#if} above it has rendered.
	function tickThen(fn) {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				fn();
				resolve();
			});
		});
	}

	onMount(() => {
		if (isViewModalOpen && reference) renderCodes(reference);
	});
</script>

<ReportModal bind:isViewModalOpen paper="receipt">
	<ReportHeader title="Laboratory Charge Slip" bannerClass="bg-report-misc" headSize="7pt" />

	<!-- Reference block: the whole point of the slip. Kept off a page break so
	     the number and its codes can never be separated. -->
	<div class="report-no-break report-gap mt-2 flex items-center gap-3 border border-black p-2">
		<div class="flex-1">
			<div class="rpt-xs uppercase tracking-wide">Reference No.</div>
			<div class="rpt-2xl font-bold leading-tight">{reference}</div>
			{#if reference}
				<!-- widened from the bars' own 2.1in to keep the quiet zones intact -->
				<svg bind:this={barcodeEl} class="mt-1 block" style="width: 2.35in; height: 0.46in" />
			{/if}
		</div>
		{#if qrMarkup}
			<div style="width: 0.95in; height: 0.95in">{@html qrMarkup}</div>
		{/if}
	</div>
	{#if codeError}
		<div class="rpt-xs mt-1">{codeError}</div>
	{:else if !codesReady}
		<!-- .report-screen-only is hidden by the @media print block in app.css;
		     Tailwind's print: variant does not emit a rule in this project. -->
		<div class="report-screen-only rpt-xs mt-1">Generating scan codes — wait before printing…</div>
	{/if}

	<!-- Who and when -->
	<div class="report-gap rpt-md mt-2 flex flex-col gap-0.5">
		<div class="flex gap-1">
			<span class="shrink-0">Name:</span>
			<span class="flex-1 border-b border-black font-bold uppercase">{data?.customer?.name || ''}&#8203;</span>
		</div>
		<div class="flex gap-2">
			<div class="flex flex-1 gap-1">
				<span class="shrink-0">Requested by:</span>
				<span class="flex-1 border-b border-black font-bold uppercase">{data?.requestedBy || ''}&#8203;</span>
			</div>
			<div class="flex gap-1" style="width: 0.85in">
				<span class="shrink-0">Age:</span>
				<span class="flex-1 border-b border-black font-bold uppercase">{data?.customer?.age ?? ''}&#8203;</span>
			</div>
			<div class="flex gap-1" style="width: 1.1in">
				<span class="shrink-0">Sex:</span>
				<span class="flex-1 border-b border-black font-bold uppercase">{data?.customer?.sex || ''}&#8203;</span>
			</div>
		</div>
		<div class="flex gap-1">
			<span class="shrink-0">Date:</span>
			<span class="flex-1 border-b border-black font-bold uppercase">
				{data?.created ? formatDateMDY(data.created) : ''}&#8203;
			</span>
		</div>
	</div>

	<!-- Tests -->
	<table class="report-gap rpt-md mt-2 w-full border-collapse">
		<thead>
			<tr class="border-y border-black">
				<th class="py-0.5 text-left font-bold" style="width: 0.55in">Code</th>
				<th class="py-0.5 text-left font-bold">Laboratory Test</th>
				<th class="py-0.5 text-center font-bold" style="width: 0.4in">Qty</th>
				<th class="py-0.5 text-right font-bold" style="width: 0.95in">Amount</th>
			</tr>
		</thead>
		<tbody>
			{#each data?.items ?? [] as item}
				<tr>
					<td class="py-0.5 align-top">{item.code}</td>
					<td class="py-0.5 align-top uppercase">{item.name}</td>
					<td class="py-0.5 text-center align-top">{item.qty}</td>
					<td class="py-0.5 text-right align-top tabular">{formatAmount(item.lineTotalCentavos)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Totals + the cashier's blanks. Held together on one page. -->
	<div class="report-no-break">
		<div class="report-gap rpt-md mt-2 flex justify-end">
			<div style="width: 2.5in">
				<div class="flex justify-between border-t border-black pt-0.5">
					<span>Gross Amount</span><span class="tabular font-bold">{formatAmount(data?.grossCentavos)}</span>
				</div>
				<div class="flex justify-between">
					<span>Less: Discount</span><span class="tabular font-bold">{formatAmount(data?.discountCentavos)}</span>
				</div>
				<div class="flex justify-between border-t border-black pt-0.5">
					<span class="font-bold">Net Amount</span>
					<span class="rpt-lg tabular font-bold">{formatAmount(data?.netCentavos)}</span>
				</div>
			</div>
		</div>

		{#if data?.discountReason}
			<div class="report-gap rpt-xs mt-1 text-right">Discount: {data.discountReason}</div>
		{/if}

		<div class="report-gap rpt-md mt-3 flex items-end gap-3">
			<div class="flex flex-1 gap-1">
				<span class="shrink-0">O.R. No.</span>
				<span class="flex-1 border-b border-black font-bold uppercase">
					{data?.payment?.orNumber || ''}&#8203;
				</span>
			</div>
			<div
				class="rpt-lg border-2 border-black px-2 py-0.5 font-bold uppercase tracking-wide"
				class:opacity-60={data?.paymentStatus !== 'Paid'}
			>
				{data?.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'}
			</div>
		</div>

		<div class="report-gap rpt-xs mt-3 flex justify-between">
			<span>Encoded by: {encodedBy}</span>
			<span>Printed: {formatDateMDY(new Date())}</span>
		</div>
		<div class="report-gap rpt-tiny mt-1 text-center">
			Present this slip at the cashier. Results are released on presentation of the official receipt.
		</div>
	</div>
</ReportModal>
