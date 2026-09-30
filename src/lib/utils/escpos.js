// @ts-nocheck
// ESC/POS byte stream for the laboratory charge slip / official receipt.
//
// The cashier's BP210 is a 58mm ESC/POS receipt printer (203 dpi, 384 dots,
// 32 columns in its 12x24 font, code page 437). Going through a Windows driver
// means rasterising HTML and hoping the driver speaks the printer's language —
// the one installed on the counter PC does not — so the slip is composed here
// as the printer's own commands and pushed down the serial port. Text, the
// Code 128 barcode and the QR are all drawn by the printer's firmware, which
// is also what makes the barcode crisp: no anti-aliasing, no rescaling.
//
// This module is pure: it turns a transaction into bytes and never touches
// the browser, so it is unit-tested and can be dumped to a file and copied to
// a COM port by hand. Sending lives in serialPrinter.js.
// Relative imports, not $lib: vitest here resolves no SvelteKit aliases.
import { formatAmount } from './currency.js';
import { formatDateMDY } from './dateHelper.js';
import {
	discountIdLabel,
	discountLineLabel,
	discountSlipHeading,
	isStatutory,
	readDiscountType
} from '../common/discounts';

/** Characters per line in the printer's normal font. */
export const COLS = 32;

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

// The same lines ReportHeader.svelte prints at the top of every paper form.
const ORG_LINES = [
	'MEDICAL MISSION GROUP HOSPITAL & HEALTH SERVICES COOPERATIVE OF ROXAS CITY AND CAPIZ',
	'Washington St., Roxas City',
	'Tel. No. (036) 6215-798'
];

// Code page 437 has the few accented letters that appear in Filipino and
// Spanish names; everything else non-ASCII is folded to its nearest ASCII.
const CP437 = {
	Ñ: 0xa5,
	ñ: 0xa4,
	É: 0x90,
	é: 0x82,
	á: 0xa0,
	í: 0xa1,
	ó: 0xa2,
	ú: 0xa3,
	ü: 0x81,
	Ü: 0x9a,
	'°': 0xf8
};
const FOLD = {
	'₱': 'P',
	'—': '-',
	'–': '-',
	'·': '-',
	'×': 'x',
	'’': "'",
	'‘': "'",
	'“': '"',
	'”': '"',
	'…': '...',
	' ': ' ',
	'​': ''
};

/**
 * Text to CP437 bytes. Control characters other than the newline are dropped
 * so a stray one in a name can never become a printer command.
 * @param {string} text
 * @returns {number[]}
 */
export function encodeText(text) {
	const out = [];
	for (const ch of String(text ?? '')) {
		const code = ch.codePointAt(0);
		if (ch === '\n') out.push(LF);
		else if (code >= 0x20 && code < 0x7f) out.push(code);
		else if (ch in CP437) out.push(CP437[ch]);
		else if (ch in FOLD) out.push(...encodeText(FOLD[ch]));
		else if (code >= 0x20) out.push(0x3f); // '?'
	}
	return out;
}

/** Word-wrap to the column width; a single word longer than a line is cut. */
export function wrap(text, width = COLS) {
	const lines = [];
	for (const paragraph of String(text ?? '').split('\n')) {
		let line = '';
		for (const word of paragraph.split(/\s+/).filter(Boolean)) {
			let w = word;
			while (w.length > width) {
				if (line) lines.push(line), (line = '');
				lines.push(w.slice(0, width));
				w = w.slice(width);
			}
			if (!line) line = w;
			else if (line.length + 1 + w.length <= width) line += ' ' + w;
			else lines.push(line), (line = w);
		}
		lines.push(line);
	}
	return lines;
}

/** A small fluent builder over a byte array. */
export class Escpos {
	constructor() {
		/** @type {number[]} */
		this.bytes = [];
	}
	raw(...b) {
		this.bytes.push(...b);
		return this;
	}
	init() {
		return this.raw(ESC, 0x40);
	}
	/** @param {'left'|'center'|'right'} where */
	align(where) {
		return this.raw(ESC, 0x61, { left: 0, center: 1, right: 2 }[where] ?? 0);
	}
	bold(on) {
		return this.raw(ESC, 0x45, on ? 1 : 0);
	}
	/** Character magnification, 1–8 each way. */
	size(w = 1, h = 1) {
		return this.raw(GS, 0x21, ((w - 1) << 4) | (h - 1));
	}
	text(s) {
		return this.raw(...encodeText(s));
	}
	line(s = '') {
		return this.text(s).raw(LF);
	}
	/** Word-wrapped paragraph. */
	para(s, width = COLS) {
		for (const l of wrap(s, width)) this.line(l);
		return this;
	}
	rule(ch = '-') {
		return this.line(ch.repeat(COLS));
	}
	/**
	 * `left` padded out and `right` flush against the right margin on one line.
	 * A left part too long for the room it has goes on its own line(s) first.
	 */
	cols(left, right) {
		left = String(left ?? '');
		right = String(right ?? '');
		const room = COLS - right.length - 1;
		if (left.length > room) {
			this.para(left);
			return this.line(right.padStart(COLS));
		}
		return this.line(left.padEnd(room) + ' ' + right);
	}
	/** Left-aligned label with the value right after it, wrapped as one string. */
	field(label, value) {
		return this.para(`${label} ${value ?? ''}`.trimEnd());
	}
	feed(n = 1) {
		return this.raw(ESC, 0x64, n);
	}
	/**
	 * Code 128 (set B), 2 dots per module, no human-readable line — the
	 * reference is printed in large type above it.
	 */
	code128(data) {
		const payload = encodeText('{B' + data);
		return this.raw(GS, 0x48, 0) // HRI: none
			.raw(GS, 0x68, 80) // height in dots
			.raw(GS, 0x77, 2) // module width in dots
			.raw(GS, 0x6b, 73, payload.length, ...payload)
			.raw(LF);
	}
	/** QR model 2, error correction M. `module` is dots per module. */
	qr(data, module = 6) {
		const payload = encodeText(data);
		const len = payload.length + 3;
		return this.raw(GS, 0x28, 0x6b, 4, 0, 0x31, 0x41, 50, 0) // model 2
			.raw(GS, 0x28, 0x6b, 3, 0, 0x31, 0x43, module)
			.raw(GS, 0x28, 0x6b, 3, 0, 0x31, 0x45, 49) // level M
			.raw(GS, 0x28, 0x6b, len & 0xff, len >> 8, 0x31, 0x50, 0x30, ...payload)
			.raw(GS, 0x28, 0x6b, 3, 0, 0x31, 0x51, 0x30);
	}
	toBytes() {
		return Uint8Array.from(this.bytes);
	}
}

/**
 * The charge slip as printer bytes. Mirrors the thermal layout of
 * LabReceiptModal.svelte line for line, so a slip looks the same whichever
 * way it reached the paper.
 *
 * @param {any} data the laboratory transaction
 * @param {{ encodedBy?: string, printedAt?: Date }} [opts]
 */
export function buildChargeSlip(data, opts = {}) {
	const p = new Escpos().init();
	const discountType = readDiscountType(data);
	const paid = data?.paymentStatus === 'Paid';
	const encodedBy =
		opts.encodedBy ??
		(data?.createdBy?.profile?.firstName || data?.createdBy?.name || data?.createdBy?.email || '');

	// Header
	p.align('center').bold(true).para(ORG_LINES[0]).bold(false);
	p.line(ORG_LINES[1]).line(ORG_LINES[2]);
	p.bold(true).line('LABORATORY DEPARTMENT').bold(false);
	p.rule();
	p.bold(true).size(1, 2).line('LABORATORY CHARGE SLIP').size(1, 1).bold(false);
	p.rule();

	// Reference and its codes — the whole point of the slip
	const reference = data?.referenceNumber ?? '';
	p.line('Reference No.');
	p.bold(true).size(2, 2).line(reference).size(1, 1).bold(false);
	if (reference) {
		p.code128(reference);
		p.qr(reference);
	}
	p.rule();

	// Who and when
	p.align('left');
	p.field('Name:', (data?.customer?.name || '').toUpperCase());
	p.field('Requested by:', (data?.requestedBy || '').toUpperCase());
	const age = data?.customer?.age ?? '';
	const sex = (data?.customer?.sex || '').toUpperCase();
	p.cols(`Age: ${age}`, `Sex: ${sex}`);
	p.field('Date:', data?.created ? formatDateMDY(data.created) : '');
	p.rule();

	// Tests
	p.bold(true).line('LABORATORY TESTS').bold(false);
	for (const item of data?.items ?? []) {
		p.bold(true).para(String(item.name || '').toUpperCase()).bold(false);
		p.cols(`  ${item.code ?? ''}  ${item.qty ?? 1} x`, formatAmount(item.lineTotalCentavos));
	}
	p.rule();

	// Totals
	p.cols('Gross Amount', formatAmount(data?.grossCentavos));
	p.cols(discountLineLabel(discountType), formatAmount(data?.discountCentavos));
	p.bold(true).cols('NET AMOUNT', formatAmount(data?.netCentavos)).bold(false);

	// BIR substantiation for the senior / PWD discount, signature line included
	// (see the note in LabReceiptModal.svelte).
	if (isStatutory(discountType)) {
		p.rule();
		p.bold(true).para(discountSlipHeading(discountType).toUpperCase()).bold(false);
		p.field(discountIdLabel(discountType), data?.discountIdNumber || '');
		p.field('Cardholder:', (data?.discountCardholderName || '').toUpperCase());
		p.line().line();
		p.line('_'.repeat(COLS));
		p.align('center').line('Signature of cardholder / representative').align('left');
	} else if (data?.discountReason) {
		p.para(`Discount: ${data.discountReason}`);
	}
	p.rule();

	// Payment
	p.field('O.R. No.:', data?.payment?.orNumber || '____________');
	p.align('center').bold(true).size(2, 2).line(paid ? 'PAID' : 'UNPAID').size(1, 1).bold(false);
	p.align('left');
	p.rule();

	// Footer
	p.line(`Encoded by: ${encodedBy}`);
	p.line(`Printed: ${formatDateMDY(opts.printedAt ?? new Date())}`);
	p.align('center').para(
		'Present this slip at the cashier. Results are released on presentation of the official receipt.'
	);
	p.align('left');
	// Room to tear off — the BP210 has no cutter.
	p.feed(4);

	return p.toBytes();
}
