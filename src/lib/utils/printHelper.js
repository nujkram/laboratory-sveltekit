import { getPaper } from '$lib/constants/reportPapers.js';

const STYLE_ID = 'report-page-size';

// @page is document-scoped, so the open report's paper size is published as a
// single <style> element in <head> rather than as a class on the report. Only
// one report is ever open at a time, so one live rule is enough.
export function setPageSize(paperName) {
	if (typeof document === 'undefined') return;
	const paper = getPaper(paperName);
	let el = document.getElementById(STYLE_ID);
	if (!el) {
		el = document.createElement('style');
		el.id = STYLE_ID;
		document.head.appendChild(el);
	}
	el.textContent = `@media print { @page { size: ${paper.size}; margin: ${paper.margin}; } }`;
}

export function clearPageSize() {
	if (typeof document === 'undefined') return;
	document.getElementById(STYLE_ID)?.remove();
}

/**
 * Print the currently open report. All hiding of app chrome happens in app.css
 * via the `body > *:not(#print-record-modal)` print rules, so no DOM surgery is
 * needed here — the report is already portalled to <body>.
 */
export function printReport() {
	window.print();
}
