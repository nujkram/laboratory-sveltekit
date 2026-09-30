// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import { buildChargeSlip, encodeText, wrap, Escpos, COLS } from './escpos.js';

const sample = {
	referenceNumber: 'LT-000002',
	customer: { name: 'Juan dela Cruz', age: 3, sex: 'Male' },
	requestedBy: 'Dr. Santos',
	created: '2026-09-30T02:00:00.000Z',
	items: [
		{ code: '410', name: 'SGPT', qty: 1, lineTotalCentavos: 21500 },
		{ code: '418', name: 'CBC', qty: 1, lineTotalCentavos: 15000 }
	],
	grossCentavos: 36500,
	discountCentavos: 0,
	netCentavos: 36500,
	discountType: 'None',
	paymentStatus: 'Paid',
	payment: { orNumber: '0001234' },
	createdBy: { profile: { firstName: 'Test' } }
};

// The printable text of a stream, with every command and its parameters
// skipped — so a barcode payload or a QR length byte never counts as a line.
// Doubles as a check that each command's length matches what the printer
// expects; a wrong length here would desynchronise the real printer too.
function asText(bytes) {
	let out = '';
	for (let i = 0; i < bytes.length; ) {
		const b = bytes[i];
		if (b === 0x1b) {
			const cmd = String.fromCharCode(bytes[i + 1]);
			if (cmd === '@') i += 2;
			else if ('aEd'.includes(cmd)) i += 3;
			else throw new Error(`unknown ESC ${cmd} at ${i}`);
		} else if (b === 0x1d) {
			const cmd = String.fromCharCode(bytes[i + 1]);
			if ('!Hhw'.includes(cmd)) i += 3;
			else if (cmd === 'k') i += 4 + bytes[i + 3];
			else if (cmd === '(') i += 5 + bytes[i + 3] + bytes[i + 4] * 256;
			else throw new Error(`unknown GS ${cmd} at ${i}`);
		} else {
			if (b === 0x0a) out += '\n';
			else if (b >= 0x20) out += b < 0x7f ? String.fromCharCode(b) : '#';
			i += 1;
		}
	}
	return out;
}

describe('encodeText', () => {
	it('keeps ASCII, maps CP437 accents, folds the rest', () => {
		expect(encodeText('Ab 1')).toEqual([0x41, 0x62, 0x20, 0x31]);
		expect(encodeText('Ñ')).toEqual([0xa5]);
		expect(encodeText('₱—·×')).toEqual([0x50, 0x2d, 0x2d, 0x78]);
		expect(encodeText('☃')).toEqual([0x3f]);
	});
	it('drops control bytes so text can never become a command', () => {
		// ESC is dropped; the '@' after it is ordinary text and stays.
		expect(encodeText('a\u001b@b')).toEqual([0x61, 0x40, 0x62]);
		expect(encodeText('x\u001dV\u0000')).toEqual([0x78, 0x56]);
	});
});

describe('wrap', () => {
	it('wraps on words and cuts words longer than a line', () => {
		expect(wrap('one two three', 7)).toEqual(['one two', 'three']);
		expect(wrap('abcdefghij', 4)).toEqual(['abcd', 'efgh', 'ij']);
	});
});

describe('Escpos.cols', () => {
	it('right-aligns the amount on the same line when it fits', () => {
		const text = asText(new Escpos().cols('Gross Amount', '365.00').toBytes());
		expect(text).toBe('Gross Amount'.padEnd(COLS - 6) + '365.00\n');
	});
	it('moves the amount to its own line when the label is long', () => {
		const text = asText(new Escpos().cols('A'.repeat(30), '1.00').toBytes());
		expect(text).toBe('A'.repeat(30) + '\n' + '1.00'.padStart(COLS) + '\n');
	});
});

describe('buildChargeSlip', () => {
	const bytes = buildChargeSlip(sample, { printedAt: new Date('2026-09-30T04:00:00Z') });
	const text = asText(bytes);

	it('starts with a reset and never prints a line wider than the paper', () => {
		expect([bytes[0], bytes[1]]).toEqual([0x1b, 0x40]);
		for (const line of text.split('\n')) expect(line.length).toBeLessThanOrEqual(COLS);
	});
	it('carries the reference as text, Code 128 and QR', () => {
		expect(text).toContain('LT-000002');
		const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(' ');
		expect(hex).toContain('1d 6b 49 0b 7b 42 4c 54'); // GS k 73 len "{BLT…"
		expect(hex).toContain('1d 28 6b 04 00 31 41 32 00'); // QR model 2
		expect(hex).toContain('1d 28 6b 03 00 31 51 30'); // QR print
	});
	it('shows the money and the payment state', () => {
		expect(text).toContain('SGPT');
		expect(text).toMatch(/NET AMOUNT\s+365\.00/);
		expect(text).toContain('O.R. No.: 0001234');
		expect(text).toContain('PAID');
	});
	it('prints the statutory box with a signature line for a senior discount', () => {
		const senior = asText(
			buildChargeSlip({
				...sample,
				discountType: 'Senior',
				discountIdNumber: 'OSCA-123',
				discountCardholderName: 'Maria Ñuñez',
				discountCentavos: 7300,
				netCentavos: 29200,
				paymentStatus: 'Unpaid',
				payment: null
			})
		);
		expect(senior).toContain('OSCA-123');
		expect(senior).toContain('_'.repeat(COLS));
		expect(senior).toContain('Signature of cardholder');
		expect(senior).toContain('UNPAID');
	});

	// `ESCPOS_DUMP=path vitest run` writes the sample slip so it can be copied
	// straight to the printer's COM port for a look at the real paper.
	it('can be dumped for a hardware check', () => {
		if (process.env.ESCPOS_DUMP) writeFileSync(process.env.ESCPOS_DUMP, bytes);
		expect(bytes.length).toBeGreaterThan(200);
	});
});
