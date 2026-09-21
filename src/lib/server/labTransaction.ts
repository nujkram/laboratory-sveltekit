import type { Db } from 'mongodb';

/**
 * Pricing for laboratory transactions. Everything money-related is computed
 * HERE, on the server, from the `lab_tests` collection — the client posts only
 * test codes and quantities. A posted price is ignored entirely, so a tampered
 * request cannot discount itself.
 *
 * The resulting line items carry a COPY of the price. That snapshot is what
 * makes an old receipt still correct after an administrator edits the catalog:
 * the transaction remembers what was actually charged, not what the test costs
 * today.
 *
 * All amounts are integer centavos (see `$lib/utils/currency`).
 */

export type RequestedItem = { code: number; qty: number };

export type LabTransactionItem = {
	code: number;
	name: string;
	section: string;
	priceCentavos: number;
	qty: number;
	lineTotalCentavos: number;
};

export type PricedTransaction = {
	items: LabTransactionItem[];
	grossCentavos: number;
	discountCentavos: number;
	netCentavos: number;
};

/** A qty above this is a typo, not an order. */
const MAX_QTY = 99;
const MAX_LINES = 60;

export class PricingError extends Error {}

/**
 * Normalise whatever the client sent into `{ code, qty }` pairs, merging
 * duplicates of the same code rather than rejecting them — a picker that adds
 * the same test twice means quantity 2.
 */
export function normaliseRequestedItems(raw: any): RequestedItem[] {
	if (!Array.isArray(raw) || raw.length === 0) {
		throw new PricingError('Select at least one laboratory test.');
	}
	if (raw.length > MAX_LINES) {
		throw new PricingError(`A transaction cannot hold more than ${MAX_LINES} tests.`);
	}

	const merged = new Map<number, number>();
	for (const entry of raw) {
		const code = Number(entry?.code);
		if (!Number.isInteger(code)) {
			throw new PricingError('A selected test has an invalid code.');
		}
		const qty = entry?.qty === undefined || entry?.qty === null ? 1 : Number(entry.qty);
		if (!Number.isInteger(qty) || qty < 1) {
			throw new PricingError(`Quantity for test ${code} must be a whole number of at least 1.`);
		}
		const total = (merged.get(code) ?? 0) + qty;
		if (total > MAX_QTY) {
			throw new PricingError(`Quantity for test ${code} cannot exceed ${MAX_QTY}.`);
		}
		merged.set(code, total);
	}

	return [...merged.entries()].map(([code, qty]) => ({ code, qty }));
}

/**
 * Price the requested codes against the live catalog.
 * @throws PricingError when a code is unknown, withdrawn or not orderable
 */
export async function priceTransaction(
	db: Db,
	rawItems: any,
	rawDiscount: any
): Promise<PricedTransaction> {
	const requested = normaliseRequestedItems(rawItems);

	const catalog = await db
		.collection('lab_tests')
		.find({ code: { $in: requested.map((entry) => entry.code) } })
		.toArray();
	const byCode = new Map(catalog.map((test: any) => [test.code, test]));

	const items: LabTransactionItem[] = requested.map(({ code, qty }) => {
		const test: any = byCode.get(code);
		if (!test) throw new PricingError(`Test ${code} is not in the laboratory catalog.`);
		if (test.isActive === false) throw new PricingError(`Test ${code} (${test.name}) is withdrawn.`);
		if (test.isAvailable === false) {
			throw new PricingError(`Test ${code} (${test.name}) is not available and cannot be ordered.`);
		}
		// Check for absence before converting: Number(null) is 0, which would
		// silently hand out a test with no price set as if it were free.
		if (test.priceCentavos === null || test.priceCentavos === undefined) {
			throw new PricingError(`Test ${code} (${test.name}) has no valid price set.`);
		}
		const priceCentavos = Number(test.priceCentavos);
		if (!Number.isInteger(priceCentavos) || priceCentavos < 0) {
			throw new PricingError(`Test ${code} (${test.name}) has no valid price set.`);
		}
		return {
			code,
			name: test.name,
			section: test.section,
			priceCentavos,
			qty,
			lineTotalCentavos: priceCentavos * qty
		};
	});

	const grossCentavos = items.reduce((sum, item) => sum + item.lineTotalCentavos, 0);

	const discountCentavos = rawDiscount === undefined || rawDiscount === null ? 0 : Number(rawDiscount);
	if (!Number.isInteger(discountCentavos) || discountCentavos < 0) {
		throw new PricingError('Discount must be a whole amount of zero or more.');
	}
	if (discountCentavos > grossCentavos) {
		throw new PricingError('Discount cannot be greater than the gross amount.');
	}

	return {
		items,
		grossCentavos,
		discountCentavos,
		netCentavos: grossCentavos - discountCentavos
	};
}

/** One entry for the transaction's append-only audit trail. */
export function auditEntry(action: string, user: any, note = '') {
	return {
		action,
		at: new Date(),
		by: user?._id ?? null,
		byName: user?.name ?? user?.profile?.firstName ?? null,
		note
	};
}
