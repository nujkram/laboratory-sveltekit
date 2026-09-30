import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Which paper the charge slip / official receipt prints on: the half-letter
// sheet for an office printer, or the 58mm thermal roll at the cashier.
//
// Kept per device in localStorage rather than in the server-side Settings,
// because the choice belongs to the machine a printer is plugged into, not to
// the organisation — the counter has the thermal printer, the encoding desk
// does not. A store, not component state, so every screen that opens the slip
// (cashier, transactions, new request) sees the same choice.
const KEY = 'receiptPaper';
const PAPERS = ['receipt', 'thermal58'];

function initial() {
	if (!browser) return 'receipt';
	try {
		const saved = localStorage.getItem(KEY) ?? '';
		return PAPERS.includes(saved) ? saved : 'receipt';
	} catch {
		return 'receipt';
	}
}

export const receiptPaper = writable(initial());

if (browser) {
	receiptPaper.subscribe((v) => {
		try {
			localStorage.setItem(KEY, v);
		} catch {
			/* ignore storage failures (private mode, etc.) */
		}
	});
}
