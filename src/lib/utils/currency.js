// Money for the laboratory transactions. Every amount in the database is an
// INTEGER NUMBER OF CENTAVOS — never a float. A charge total built from floats
// drifts (0.1 + 0.2 !== 0.3), and on a receipt the customer is handed that is
// not acceptable. Nothing outside this file formats or parses money.

const pesoFormatter = new Intl.NumberFormat('en-PH', {
	style: 'currency',
	currency: 'PHP',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

const amountFormatter = new Intl.NumberFormat('en-PH', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

/**
 * Centavos to a display string with the peso sign, e.g. 160000 -> "₱1,600.00".
 * @param {number | null | undefined} centavos
 */
export function formatPeso(centavos) {
	return pesoFormatter.format(safeCentavos(centavos) / 100);
}

/**
 * Centavos to a bare grouped amount, e.g. 160000 -> "1,600.00". Used in the
 * receipt's amount column, where the peso sign sits in the header instead.
 * @param {number | null | undefined} centavos
 */
export function formatAmount(centavos) {
	return amountFormatter.format(safeCentavos(centavos) / 100);
}

/**
 * Parse user or document input into centavos. Accepts "1,000.00", "₱1000",
 * "1000", " 1000.5 " and plain numbers (read as pesos).
 *
 * Strings are split on the decimal point and converted digit-wise rather than
 * via parseFloat, so no rounding error can enter. A third decimal is truncated,
 * not rounded — "1.005" is 100 centavos — because a centavo is the smallest
 * unit the hospital can actually charge.
 *
 * @param {string | number | null | undefined} value
 * @returns {number | null} centavos, or null when the input is not a number
 */
export function toCentavos(value) {
	if (value === null || value === undefined || value === '') return null;

	if (typeof value === 'number') {
		if (!Number.isFinite(value)) return null;
		return Math.round(value * 100);
	}

	const cleaned = String(value)
		.trim()
		.replace(/[₱\s,]/g, '');
	if (!/^-?\d*\.?\d*$/.test(cleaned)) return null;

	const negative = cleaned.startsWith('-');
	const digits = negative ? cleaned.slice(1) : cleaned;
	if (digits === '' || digits === '.') return null;

	const [whole = '', fraction = ''] = digits.split('.');
	const centavos = Number(whole || '0') * 100 + Number(`${fraction}00`.slice(0, 2));
	if (!Number.isFinite(centavos)) return null;

	return negative ? -centavos : centavos;
}

/** Alias kept for readability at call sites that are parsing a typed field. */
export const parsePeso = toCentavos;

/** @param {number | null | undefined} centavos */
function safeCentavos(centavos) {
	return typeof centavos === 'number' && Number.isFinite(centavos) ? centavos : 0;
}
