<script>
	// @ts-nocheck
	// Shared shell for the printable report modals: backdrop, Escape/close
	// handling, the Print/Close bar, and the #print-record-modal / #report-sheet
	// ids that the app.css print rules key off.
	//
	// The sheet is sized in physical units from a paper preset so the printout
	// matches the original Word form 1:1 — no zoom, no px font sizes.
	import { onDestroy } from 'svelte';
	import { portal } from '$lib/actions/portal.js';
	import { getPaper } from '$lib/constants/reportPapers.js';
	import { printReport, setPageSize, clearPageSize } from '$lib/utils/printHelper.js';

	export let isViewModalOpen = false;
	/** key of $lib/constants/reportPapers — the form's original paper size */
	export let paper = 'letter';
	/**
	 * The laboratory transaction this result was charged under, when it is
	 * linked to one: `{ referenceNumber, paymentStatus, status }`.
	 *
	 * The slip printed at the counter says results are released on presentation
	 * of the official receipt; this is what lets the app know whether that
	 * receipt exists. Left null — by every record predating the link, by
	 * anything encoded offline, and by the receipt itself — printing behaves
	 * exactly as it always has.
	 */
	export let transaction = null;

	// Deliberately a prompt, not a block. A result that cannot be printed in an
	// emergency is a worse failure than one released before the cashier has been
	// paid, and the med-tech cannot see whether the patient is mid-payment.
	$: unpaid = !!transaction && transaction.paymentStatus !== 'Paid';
	let confirmingRelease = false;

	function handlePrint() {
		if (unpaid && !confirmingRelease) {
			confirmingRelease = true;
			return;
		}
		confirmingRelease = false;
		printReport();
	}

	// Never carry the prompt over to the next report opened.
	$: if (!isViewModalOpen) confirmingRelease = false;

	const handleCloseModal = () => (isViewModalOpen = false);

	$: sheet = getPaper(paper);
	// The Misc paper depends on the selected exam, so re-publish on every change.
	$: if (isViewModalOpen) setPageSize(paper);
	$: if (!isViewModalOpen) clearPageSize();

	onDestroy(clearPageSize);
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && isViewModalOpen && handleCloseModal()} />

<!-- Portalled to <body> so printing can hide its siblings and let the report
     flow across pages; on screen it positions itself over the app. -->
<div
	use:portal
	class="report-modal {isViewModalOpen ? 'block' : 'hidden'}"
	id="print-record-modal"
	style="--sheet-width: {sheet.content}; --sheet-base: {sheet.base}; --sheet-head: {sheet.head};"
>
	<div class="report-backdrop" on:click={handleCloseModal} />
	<div class="report-scroll">
		<div class="report-card" on:click|stopPropagation>
			<div id="nav-modal">
				<button
					class="absolute top-3 left-2.5 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors {confirmingRelease
						? 'bg-warning hover:bg-warningHover'
						: 'bg-primary hover:bg-primaryHover'}"
					on:click={handlePrint}
				>
					{confirmingRelease ? 'Release anyway?' : 'Print'}
				</button>
				{#if confirmingRelease}
					<button
						class="absolute top-3 left-[9.5rem] inline-flex items-center rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper"
						on:click={() => (confirmingRelease = false)}
					>
						Cancel
					</button>
				{/if}
				{#if unpaid}
					<p class="absolute top-4 left-64 text-xs font-medium text-warning">
						Charge slip {transaction.referenceNumber} is
						{transaction.status === 'Cancelled' ? 'cancelled' : 'unpaid'} — the official receipt
						has not been issued.
					</p>
				{:else}
					<!-- Chrome draws its own URL/date strip inside the page margin and
					     lets the user override margins per destination; both silently
					     break a form that has to match the paper 1:1. -->
					<p class="absolute top-4 left-20 text-xs text-muted">
						In the print dialog set <span class="font-medium">Margins: Default</span>, untick
						<span class="font-medium">Headers and footers</span>, and tick
						<span class="font-medium">Background graphics</span>.
					</p>
				{/if}
				<button
					on:click={handleCloseModal}
					type="button"
					class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
				>
					<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
						><path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/></svg
					>
					<span class="sr-only">Close modal</span>
				</button>
			</div>
			<div id="report-sheet">
				<slot />
			</div>
		</div>
	</div>
</div>

<style>
	.report-modal {
		position: fixed;
		inset: 0;
		z-index: 50;
	}
	.report-backdrop {
		position: fixed;
		inset: 0;
		background: rgb(13 20 16 / 0.4);
		backdrop-filter: blur(4px);
	}
	.report-scroll {
		position: relative;
		height: 100%;
		overflow-y: auto;
		padding: 2.5rem 1rem;
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}
	/* Some Word tables deliberately run up to 0.5in past the sheet's edge
	   (the CBC index box, the parasitology cell counts), so the on-screen
	   card carries that much side padding to show them the way the paper
	   does. In print the padding is zeroed and @page margins take over. */
	.report-card {
		position: relative;
		background: #fff;
		border-radius: 0.5rem;
		box-shadow: 0 10px 25px rgb(0 0 0 / 0.25);
		padding: 3rem 0.5in 1.5rem;
	}

	/* The paper forms are set in Arial — the report sheet matches on screen and
	   in print so doctors see the familiar face. Width and base size come from
	   the paper preset, in inches/points, so the sheet is true to the form. */
	#report-sheet {
		font-family: Arial, Helvetica, sans-serif;
		font-size: var(--sheet-base, 10pt);
		line-height: 1.2;
		color: #000;
		width: var(--sheet-width, 6.5in);
	}

	@media print {
		.report-modal {
			display: block !important;
		}
		.report-backdrop {
			display: none !important;
		}
		.report-scroll {
			position: static;
			height: auto;
			overflow: visible;
			padding: 0;
			display: block;
		}
		.report-card {
			position: static;
			border-radius: 0;
			box-shadow: none;
			padding: 0;
		}
	}
</style>
