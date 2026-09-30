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
	//
	// Two papers, chosen per device (see $lib/stores/receiptPaper): the
	// half-letter sheet for an office printer, and a 44mm single column for the
	// 58mm thermal roll at the cashier. The thermal layout has no logo, no fills
	// and no opacity — a 1-bit printer dithers all of those into grey noise.
	import { onMount, tick } from 'svelte';
	import ReportModal from '$lib/components/report/ReportModal.svelte';
	import ReportHeader from '$lib/components/report/ReportHeader.svelte';
	import { formatAmount } from '$lib/utils/currency';
	import {
		discountIdLabel,
		discountLineLabel,
		discountSlipHeading,
		isStatutory,
		readDiscountType
	} from '$lib/common/discounts';
	import { formatDateMDY } from '$lib/utils/dateHelper.js';
	import { receiptPaper } from '$lib/stores/receiptPaper.js';
	import { buildChargeSlip } from '$lib/utils/escpos.js';
	import { choosePort, printBytes, serialSupported } from '$lib/utils/serialPrinter.js';

	export let isViewModalOpen = false;
	export let data;

	// Direct ESC/POS printing over the receipt printer's serial port — no
	// Windows driver in the way (the counter's is a label driver that garbles
	// the slip). Chromium desktop only; the button is simply absent elsewhere.
	const canPrintDirect = serialSupported();
	let sending = false;
	let sendStatus = '';
	let sendFailed = false;

	async function printDirect() {
		if (sending || !data) return;
		sending = true;
		sendFailed = false;
		sendStatus = 'Sending to the receipt printer…';
		try {
			await printBytes(buildChargeSlip(data, { encodedBy }));
			sendStatus = 'Sent. Tear off the slip.';
		} catch (e) {
			sendFailed = true;
			sendStatus = e?.message || 'Could not print.';
		} finally {
			sending = false;
		}
	}

	async function pickPrinterPort() {
		sendFailed = false;
		try {
			await choosePort();
			sendStatus = 'Printer port saved for this browser.';
		} catch (e) {
			sendFailed = e?.code !== 'CANCELLED';
			sendStatus = e?.message || 'No port was chosen.';
		}
	}

	// Never carry a stale status into the next slip.
	$: if (!isViewModalOpen) sendStatus = '';

	let barcodeEl;
	let qrMarkup = '';
	let codeError = '';
	// The two generators are fetched on demand, so on a cold cache there is a
	// moment where the slip has a reference but no codes. Say so, otherwise
	// someone prints in that window and hands over a slip the cashier's scanner
	// cannot read.
	let codesReady = false;
	// Physical size of the thermal barcode, computed from the symbol so each
	// module lands on exactly two printer dots (see renderCodes).
	let barcodeStyle = '';
	// Switching paper rebuilds the <svg>; a token stops a render started for the
	// old element from finishing in the new one.
	let renderSeq = 0;

	$: thermal = $receiptPaper === 'thermal58';
	$: reference = data?.referenceNumber ?? '';
	$: encodedBy =
		data?.createdBy?.profile?.firstName || data?.createdBy?.name || data?.createdBy?.email || '';
	$: discountType = readDiscountType(data);
	$: unpaid = data?.paymentStatus !== 'Paid';

	const THERMAL_HINT =
		'Pick the thermal printer and its 58 mm roll paper. Margins: Default, Scale: Default, untick Headers and footers.';

	// Redraw whenever the modal opens with a different transaction, or the
	// paper changes (each paper has its own <svg>).
	$: if (isViewModalOpen && reference) renderCodes(reference, thermal);

	async function renderCodes(value, onThermal) {
		const id = ++renderSeq;
		codeError = '';
		codesReady = false;
		try {
			// Loaded on demand so neither library sits in the main bundle — the
			// receipt is the only screen that needs them.
			const [{ default: JsBarcode }, QRCode] = await Promise.all([
				import('jsbarcode'),
				import('qrcode')
			]);

			const qr = await QRCode.toString(value, {
				type: 'svg',
				errorCorrectionLevel: 'M',
				margin: 0
			});
			if (id !== renderSeq) return;
			qrMarkup = qr;

			// The <svg> only exists once the {#if} around it has rendered; tick()
			// resolves after that flush. (Not requestAnimationFrame: a background
			// tab never gets a frame, and the slip must be ready when it is
			// brought forward to print.)
			await tick();
			if (id !== renderSeq) return;
			if (barcodeEl) {
				if (onThermal) {
					// A 203 dpi head puts 8 dots to the millimetre. The driver
					// rasterises whatever the browser hands it, so a module that is
					// not a whole number of dots comes out as alternating 1- and
					// 3-dot bars and the laser scanner misreads. Draw the symbol at
					// one unit per module, then size it so a unit is 0.25mm = 2
					// dots; both axes from the same factor, or preserveAspectRatio
					// letterboxes and the module width drifts.
					JsBarcode(barcodeEl, value, {
						format: 'CODE128',
						displayValue: false,
						margin: 0,
						// Code 128's minimum quiet zone is 10 modules either side.
						marginLeft: 10,
						marginRight: 10,
						width: 1,
						height: 48,
						background: 'transparent',
						lineColor: '#000000'
					});
					const { width, height } = barcodeEl.viewBox.baseVal;
					barcodeStyle = `width: ${width * 0.25}mm; height: ${height * 0.25}mm`;
				} else {
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
				}
			}
			codesReady = true;
		} catch (error) {
			if (id !== renderSeq) return;
			// A receipt without a code is still a valid receipt — the reference is
			// printed in large type right beside it and can be keyed by hand.
			codeError = 'Code could not be generated — key the reference in manually.';
			console.error('receipt code generation failed:', error);
		}
	}

	onMount(() => {
		if (isViewModalOpen && reference) renderCodes(reference, thermal);
	});
</script>

<ReportModal bind:isViewModalOpen paper={$receiptPaper} printHint={thermal ? THERMAL_HINT : ''}>
	<div slot="controls" class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs">
		{#if canPrintDirect}
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primaryHover disabled:opacity-60"
				disabled={sending || !data}
				on:click={printDirect}
			>
				{sending ? 'Sending…' : 'Print on receipt printer'}
			</button>
			<button type="button" class="font-medium text-muted hover:text-ink" on:click={pickPrinterPort}>
				Choose port
			</button>
			{#if sendStatus}
				<span class="font-medium {sendFailed ? 'text-danger' : 'text-pine-700'}" role="status">
					{sendStatus}
				</span>
			{/if}
			<span class="hidden h-4 w-px bg-line sm:inline-block" aria-hidden="true" />
		{/if}
		<span class="text-muted">Browser print on</span>
		<div class="inline-flex overflow-hidden rounded-lg border border-line" role="group" aria-label="Paper">
			<button
				type="button"
				class="px-2.5 py-1 font-medium transition-colors {thermal
					? 'bg-surface text-ink hover:bg-paper'
					: 'bg-primary text-white'}"
				aria-pressed={!thermal}
				on:click={() => receiptPaper.set('receipt')}
			>
				Half letter
			</button>
			<button
				type="button"
				class="border-l border-line px-2.5 py-1 font-medium transition-colors {thermal
					? 'bg-primary text-white'
					: 'bg-surface text-ink hover:bg-paper'}"
				aria-pressed={thermal}
				on:click={() => receiptPaper.set('thermal58')}
			>
				58 mm thermal
			</button>
		</div>
	</div>

	{#if thermal}
		<ReportHeader title="Laboratory Charge Slip" variant="thermal" headSize="7pt" />

		<!-- Reference block, one column: number, barcode, QR. -->
		<div class="report-no-break report-gap mt-1.5 text-center">
			<div class="rpt-xs uppercase tracking-wide">Reference No.</div>
			<div class="rpt-2xl font-bold leading-tight">{reference}</div>
			{#if reference}
				<svg
					bind:this={barcodeEl}
					shape-rendering="crispEdges"
					class="mx-auto mt-1 block"
					style={barcodeStyle}
				/>
			{/if}
			{#if qrMarkup}
				<div class="mx-auto mt-1.5" style="width: 18mm; height: 18mm">{@html qrMarkup}</div>
			{/if}
		</div>
	{:else}
		<ReportHeader title="Laboratory Charge Slip" bannerClass="bg-report-misc" headSize="7pt" />

		<!-- Reference block: the whole point of the slip. Kept off a page break so
		     the number and its codes can never be separated. -->
		<div class="report-no-break report-gap mt-2 flex items-center gap-3 border border-black p-2">
			<div class="flex-1">
				<div class="rpt-xs uppercase tracking-wide">Reference No.</div>
				<div class="rpt-2xl font-bold leading-tight">{reference}</div>
				{#if reference}
					<!-- widened from the bars' own 2.1in to keep the quiet zones intact -->
					<svg
						bind:this={barcodeEl}
						shape-rendering="crispEdges"
						class="mt-1 block"
						style="width: 2.35in; height: 0.46in"
					/>
				{/if}
			</div>
			{#if qrMarkup}
				<div style="width: 0.95in; height: 0.95in">{@html qrMarkup}</div>
			{/if}
		</div>
	{/if}
	{#if codeError}
		<div class="rpt-xs mt-1">{codeError}</div>
	{:else if !codesReady}
		<!-- .report-screen-only is hidden by the @media print block in app.css;
		     Tailwind's print: variant does not emit a rule in this project. -->
		<div class="report-screen-only rpt-xs mt-1">Generating scan codes — wait before printing…</div>
	{/if}

	{#if thermal}
		<!-- Who and when, one field per line -->
		<div class="report-gap rpt-md mt-1.5 flex flex-col gap-0.5">
			<div class="flex gap-1">
				<span class="shrink-0">Name:</span>
				<span class="flex-1 border-b border-black font-bold uppercase">{data?.customer?.name || ''}&#8203;</span>
			</div>
			<div class="flex gap-1">
				<span class="shrink-0">Requested by:</span>
				<span class="flex-1 border-b border-black font-bold uppercase">{data?.requestedBy || ''}&#8203;</span>
			</div>
			<div class="flex gap-2">
				<div class="flex flex-1 gap-1">
					<span class="shrink-0">Age:</span>
					<span class="flex-1 border-b border-black font-bold uppercase">{data?.customer?.age ?? ''}&#8203;</span>
				</div>
				<div class="flex flex-1 gap-1">
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

		<!-- Tests: two lines per item, since four columns do not fit in 44mm -->
		<div class="report-gap rpt-md mt-1.5 border-t border-black pt-0.5">
			<div class="rpt-xs font-bold uppercase tracking-wide">Laboratory tests</div>
			{#each data?.items ?? [] as item}
				<div class="py-0.5">
					<div class="font-bold uppercase">{item.name}</div>
					<div class="flex justify-between gap-2">
						<span>{item.code} · {item.qty} ×</span>
						<span class="tabular">{formatAmount(item.lineTotalCentavos)}</span>
					</div>
				</div>
			{/each}
		</div>
	{:else}
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
	{/if}

	<!-- Totals + the cashier's blanks. Held together on one page. -->
	<div class="report-no-break">
		<div class="report-gap rpt-md {thermal ? 'mt-1' : 'mt-2'} flex justify-end">
			<div style={thermal ? 'width: 100%' : 'width: 2.5in'}>
				<div class="flex justify-between border-t border-black pt-0.5">
					<span>Gross Amount</span><span class="tabular font-bold">{formatAmount(data?.grossCentavos)}</span>
				</div>
				<div class="flex justify-between gap-2">
					<span>{discountLineLabel(discountType)}</span><span class="tabular font-bold">{formatAmount(data?.discountCentavos)}</span>
				</div>
				<div class="flex justify-between border-t border-black pt-0.5">
					<span class="font-bold">Net Amount</span>
					<span class="rpt-lg tabular font-bold">{formatAmount(data?.netCentavos)}</span>
				</div>
			</div>
		</div>

		{#if isStatutory(discountType)}
			<!-- BIR substantiation for RA 9994 / RA 10754. The cardholder's name, the
			     OSCA/PWD ID number, the separately stated gross-discount-net above,
			     and a SIGNATURE are what make the 20% deductible. The signature rule
			     has to be pre-printed — it cannot be added to a slip after the fact,
			     and it is the first thing an examiner looks for. -->
			<div class="report-gap rpt-xs mt-2 border border-black px-2 py-1">
				<div class="font-bold uppercase tracking-wide">{discountSlipHeading(discountType)}</div>
				<div class="mt-0.5 flex gap-1">
					<span class="shrink-0">{discountIdLabel(discountType)}</span>
					<span class="flex-1 border-b border-black font-bold">{data?.discountIdNumber || ''}&#8203;</span>
				</div>
				<div class="mt-0.5 flex gap-1">
					<span class="shrink-0">Cardholder:</span>
					<span class="flex-1 border-b border-black font-bold uppercase">
						{data?.discountCardholderName || ''}&#8203;
					</span>
				</div>
				<div class="mt-2 flex gap-1">
					<span class="flex-1 border-b border-black">&#8203;</span>
				</div>
				<div class="{thermal ? 'rpt-xs' : 'rpt-tiny'} text-center">
					Signature of cardholder / representative
				</div>
			</div>
		{:else if data?.discountReason}
			<div class="report-gap rpt-xs mt-1 text-right">Discount: {data.discountReason}</div>
		{/if}

		<div class="report-gap rpt-md mt-3 flex items-end gap-3">
			<div class="flex flex-1 gap-1">
				<span class="shrink-0">O.R. No.</span>
				<span class="flex-1 border-b border-black font-bold uppercase">
					{data?.payment?.orNumber || ''}&#8203;
				</span>
			</div>
			<!-- The faded UNPAID stamp is for the office printer only: on thermal
			     paper 60% grey is a dithered smear, so the word prints solid. -->
			<div
				class="rpt-lg border-2 border-black px-2 py-0.5 font-bold uppercase tracking-wide"
				class:opacity-60={unpaid && !thermal}
			>
				{unpaid ? 'Unpaid' : 'Paid'}
			</div>
		</div>

		<div class="report-gap rpt-xs mt-3 flex {thermal ? 'flex-col gap-0.5' : 'justify-between'}">
			<span>Encoded by: {encodedBy}</span>
			<span>Printed: {formatDateMDY(new Date())}</span>
		</div>
		<!-- 0.7em of an 8pt base is a 16-dot glyph on the thermal head — unreadable,
		     so the roll keeps to rpt-xs. -->
		<div class="report-gap {thermal ? 'rpt-xs' : 'rpt-tiny'} mt-1 text-center">
			Present this slip at the cashier. Results are released on presentation of the official receipt.
		</div>
	</div>
</ReportModal>
