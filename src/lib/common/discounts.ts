/**
 * Statutory and ad-hoc discounts for laboratory transactions.
 *
 * Senior citizens (RA 9994) and persons with disability (RA 10754) are entitled
 * to 20% off medical and laboratory services. Medical Mission Group is NOT
 * VAT-registered, so there is no VAT to strip and no VAT-exempt sale line: the
 * discount is a plain 20% of the gross amount.
 *
 * This module is imported by BOTH the server (the insert and discount endpoints)
 * and the browser (the request form, the cashier screen, the printed slip), so a
 * total previewed on screen and a total committed to the database come out of the
 * same code. It therefore imports NOTHING — an import here risks dragging a
 * server-only dependency into the client bundle the way `access.ts` drags in
 * bcryptjs through `./utils`.
 *
 * That is also why validation returns a RESULT OBJECT instead of throwing:
 * `PricingError` lives under `$lib/server` and cannot be reached from here, and a
 * Svelte reactive statement cannot try/catch cleanly. The server turns a failed
 * result into a PricingError at the `$lib/server/labTransaction` layer.
 *
 * All amounts are integer centavos (see `$lib/utils/currency`).
 */

export const DISCOUNT_TYPES = ['None', 'Senior', 'PWD', 'Other'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

/**
 * RA 9994 / RA 10754. Snapshotted onto each transaction so an old slip reprints
 * at the rate that was actually granted, even if the statute later moves.
 */
export const STATUTORY_DISCOUNT_PERCENT = 20;

export const MAX_DISCOUNT_ID_LENGTH = 40;
export const MAX_DISCOUNT_NAME_LENGTH = 120;
export const MAX_DISCOUNT_REASON_LENGTH = 120;

/**
 * Whatever the client sent. Every field is `unknown` on purpose: this runs on
 * untrusted input on the server and on half-typed input in the browser.
 */
export type DiscountInput = {
	type?: unknown;
	idNumber?: unknown;
	cardholderName?: unknown;
	/** Read ONLY when type is 'Other'. Ignored outright for Senior and PWD. */
	amountCentavos?: unknown;
	/** Read ONLY when type is 'Other'. Derived for Senior and PWD. */
	reason?: unknown;
};

/**
 * Exactly the transaction document's discount fields. Both write paths `$set`
 * this object wholesale, so they cannot drift apart.
 */
export type ResolvedDiscount = {
	discountType: DiscountType;
	discountCentavos: number;
	discountReason: string;
	discountIdNumber: string;
	discountCardholderName: string;
	discountRatePercent: number;
};

export type DiscountField = 'type' | 'idNumber' | 'cardholderName' | 'amount' | 'reason';

export type DiscountResult =
	| { ok: true; value: ResolvedDiscount }
	| { ok: false; message: string; field: DiscountField };

/** An ID number as printed on an OSCA or PWD card. Deliberately permissive. */
const ID_PATTERN = /^[A-Za-z0-9 .,#()\/-]+$/;

/**
 * The shape the discount form binds to. `amountInput` is the raw typed string so
 * that `toCentavos` stays the only thing parsing money; everything else is what
 * the user actually entered, untrimmed.
 */
export type DiscountForm = {
	type: DiscountType;
	idNumber: string;
	cardholderName: string;
	amountInput: string;
	reason: string;
};

export function emptyDiscountForm(): DiscountForm {
	return { type: 'None', idNumber: '', cardholderName: '', amountInput: '', reason: '' };
}

/**
 * Fill the form from a stored transaction, so the cashier corrects a discount the
 * encoder already applied instead of silently retyping it.
 */
export function discountFormFrom(doc: any): DiscountForm {
	const type = readDiscountType(doc);
	if (type === 'None') return emptyDiscountForm();
	return {
		type,
		idNumber: String(doc?.discountIdNumber ?? ''),
		cardholderName: String(doc?.discountCardholderName ?? ''),
		// Only 'Other' has a typed amount; a statutory one is always recomputed.
		amountInput: type === 'Other' ? centavosToInput(doc?.discountCentavos) : '',
		reason: type === 'Other' ? String(doc?.discountReason ?? '') : ''
	};
}

/** Centavos back to the plain "1234.50" a text input holds. */
function centavosToInput(centavos: unknown): string {
	const value = Number(centavos);
	if (!Number.isFinite(value) || value <= 0) return '';
	return (value / 100).toFixed(2);
}

/**
 * 20% of an integer centavo amount.
 *
 * 20% of N centavos is exactly N / 5, so the fractional part can only ever be
 * .0, .2, .4, .6 or .8 — an exact half is arithmetically impossible. There is no
 * tie to break, so the usual round-half-up versus bankers-rounding argument does
 * not arise at all and no rounding policy is being smuggled in here. The largest
 * possible deviation from a true 20% is 0.4 of a centavo.
 *
 * Done on integers throughout so that no float division enters the money path.
 */
export function statutoryDiscountCentavos(grossCentavos: number): number {
	if (!Number.isSafeInteger(grossCentavos) || grossCentavos <= 0) return 0;
	const remainder = grossCentavos % 5;
	const whole = (grossCentavos - remainder) / 5; // exact: divisible by 5
	return remainder >= 3 ? whole + 1 : whole;
}

export function isStatutory(type: DiscountType): boolean {
	return type === 'Senior' || type === 'PWD';
}

export function discountTypeLabel(type: DiscountType): string {
	if (type === 'Senior') return 'Senior Citizen';
	if (type === 'PWD') return 'PWD';
	if (type === 'Other') return 'Other';
	return 'No discount';
}

/** The label for the middle row of a gross / discount / net totals block. */
export function discountLineLabel(type: DiscountType): string {
	if (isStatutory(type)) {
		return `Less: ${discountTypeLabel(type)} discount (${STATUTORY_DISCOUNT_PERCENT}%)`;
	}
	return 'Less: discount';
}

/** Caption for the ID number field, and for the printed slip. */
export function discountIdLabel(type: DiscountType): string {
	if (type === 'Senior') return 'OSCA / Senior Citizen ID No.';
	if (type === 'PWD') return 'PWD ID No.';
	return 'ID No.';
}

/** Heading of the substantiation box on the printed charge slip. */
export function discountSlipHeading(type: DiscountType): string {
	if (type === 'Senior') return `SENIOR CITIZEN DISCOUNT (${STATUTORY_DISCOUNT_PERCENT}%)`;
	if (type === 'PWD') return `PERSON WITH DISABILITY DISCOUNT (${STATUTORY_DISCOUNT_PERCENT}%)`;
	return '';
}

/**
 * The discount type of a stored transaction, safe on documents written before
 * discount types existed.
 */
export function readDiscountType(doc: any): DiscountType {
	const stored = doc?.discountType;
	if (typeof stored === 'string' && (DISCOUNT_TYPES as readonly string[]).includes(stored)) {
		return stored as DiscountType;
	}
	// A legacy document carries free text and no captured ID number. Reading
	// "senior" out of that reason and calling it a Senior discount would print a
	// BIR-deductible claim the laboratory cannot substantiate, so an old discount
	// is honestly reported as ad-hoc. Do not "improve" this into a text match.
	return Number(doc?.discountCentavos) > 0 ? 'Other' : 'None';
}

/** The stored reason for a statutory discount. Derived, never client-supplied. */
function statutoryReason(type: DiscountType, cardholderName: string, idNumber: string): string {
	const rate = STATUTORY_DISCOUNT_PERCENT;
	return `${discountTypeLabel(type)} ${rate}% - ${cardholderName} (ID ${idNumber})`;
}

const NONE: ResolvedDiscount = {
	discountType: 'None',
	discountCentavos: 0,
	discountReason: '',
	discountIdNumber: '',
	discountCardholderName: '',
	discountRatePercent: 0
};

function text(value: unknown): string {
	return value === null || value === undefined ? '' : String(value).trim();
}

/**
 * Validate and compute a discount against a gross amount.
 *
 * A senior citizen who is also a PWD may hold both cards but may claim only ONE
 * 20% discount on the same purchase — the two are not cumulative. A single
 * `discountType` enforces that by construction, which is why this is a choice of
 * one type and not a set of checkboxes. Please leave it that way.
 */
export function resolveDiscount(grossCentavos: number, raw: DiscountInput): DiscountResult {
	const gross = Number.isSafeInteger(grossCentavos) && grossCentavos > 0 ? grossCentavos : 0;

	const rawType = text(raw?.type) || 'None';
	if (!(DISCOUNT_TYPES as readonly string[]).includes(rawType)) {
		return { ok: false, message: 'Choose a valid discount type.', field: 'type' };
	}
	const type = rawType as DiscountType;

	if (type === 'None') {
		return { ok: true, value: { ...NONE } };
	}

	if (isStatutory(type)) {
		const label = discountTypeLabel(type);

		const idNumber = text(raw?.idNumber);
		if (!idNumber) {
			return {
				ok: false,
				message: `A ${label} ID number is required for this discount.`,
				field: 'idNumber'
			};
		}
		if (idNumber.length > MAX_DISCOUNT_ID_LENGTH) {
			return {
				ok: false,
				message: `The ID number cannot be longer than ${MAX_DISCOUNT_ID_LENGTH} characters.`,
				field: 'idNumber'
			};
		}
		// Only a character check. OSCA and PWD card layouts vary by local
		// government unit, so a pattern that insisted on a shape would turn real
		// cardholders away at the counter.
		if (!ID_PATTERN.test(idNumber)) {
			return {
				ok: false,
				message: 'The ID number contains characters that are not allowed.',
				field: 'idNumber'
			};
		}

		const cardholderName = text(raw?.cardholderName);
		if (!cardholderName) {
			return {
				ok: false,
				message: 'The name printed on the ID is required for this discount.',
				field: 'cardholderName'
			};
		}
		if (cardholderName.length > MAX_DISCOUNT_NAME_LENGTH) {
			return {
				ok: false,
				message: `The name cannot be longer than ${MAX_DISCOUNT_NAME_LENGTH} characters.`,
				field: 'cardholderName'
			};
		}

		// `raw.amountCentavos` is ignored on purpose. The statutory amount is
		// always computed here, so a tampered request body cannot move it by a
		// single centavo. A gross of zero yields a discount of zero and is still a
		// valid claim: the ID is captured either way.
		return {
			ok: true,
			value: {
				discountType: type,
				discountCentavos: statutoryDiscountCentavos(gross),
				discountReason: statutoryReason(type, cardholderName, idNumber),
				discountIdNumber: idNumber,
				discountCardholderName: cardholderName,
				discountRatePercent: STATUTORY_DISCOUNT_PERCENT
			}
		};
	}

	// 'Other' is an ad-hoc concession: a company account, a charity case, a promo.
	// The amount is still client-supplied, so it is range-checked rather than
	// computed; the mandatory reason plus the history[] entry are what make a
	// large one attributable to the person who granted it.
	const amountCentavos = Number(raw?.amountCentavos ?? 0);
	if (!Number.isSafeInteger(amountCentavos) || amountCentavos < 0) {
		return {
			ok: false,
			message: 'The discount must be a whole amount of zero or more.',
			field: 'amount'
		};
	}
	if (amountCentavos > gross) {
		return {
			ok: false,
			message: 'The discount cannot be greater than the gross amount.',
			field: 'amount'
		};
	}

	const reason = text(raw?.reason);
	if (!reason) {
		return { ok: false, message: 'A reason is required for this discount.', field: 'reason' };
	}
	if (reason.length > MAX_DISCOUNT_REASON_LENGTH) {
		return {
			ok: false,
			message: `The reason cannot be longer than ${MAX_DISCOUNT_REASON_LENGTH} characters.`,
			field: 'reason'
		};
	}

	return {
		ok: true,
		value: {
			discountType: 'Other',
			discountCentavos: amountCentavos,
			discountReason: reason,
			discountIdNumber: '',
			discountCardholderName: '',
			discountRatePercent: 0
		}
	};
}
