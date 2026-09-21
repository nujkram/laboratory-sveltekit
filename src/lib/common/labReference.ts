/**
 * The laboratory transaction reference number, shared by the browser (display,
 * barcode, QR) and the server (lookup), so both sides can never disagree on
 * what "LT-000123" means.
 *
 * `transactionNo` is the authoritative value: an integer from an atomic counter.
 * The string is only a presentation of it.
 */

export const REFERENCE_PREFIX = 'LT-';
const REFERENCE_DIGITS = 6;

/** 123 -> "LT-000123" */
export function formatReference(transactionNo: number | null | undefined): string {
	if (typeof transactionNo !== 'number' || !Number.isFinite(transactionNo)) return '';
	return REFERENCE_PREFIX + String(Math.trunc(transactionNo)).padStart(REFERENCE_DIGITS, '0');
}

/**
 * Turn anything a cashier might scan or type back into the integer.
 * Accepts "LT-000123", "lt-123", "000123", "123" and stray whitespace, so a
 * scanner's full string and a hand-typed short number reach the same record.
 *
 * @returns the transaction number, or null when the input isn't one
 */
export function parseReference(input: string | number | null | undefined): number | null {
	if (typeof input === 'number') {
		return Number.isInteger(input) && input > 0 ? input : null;
	}
	if (!input) return null;

	const cleaned = String(input).trim().toUpperCase().replace(/\s|-/g, '');
	const digits = cleaned.startsWith('LT') ? cleaned.slice(2) : cleaned;
	if (!/^\d+$/.test(digits)) return null;

	const value = Number(digits);
	return Number.isSafeInteger(value) && value > 0 ? value : null;
}
