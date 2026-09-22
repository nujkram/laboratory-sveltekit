import { describe, expect, it } from 'vitest';
import {
	readDiscountType,
	resolveDiscount,
	statutoryDiscountCentavos,
	STATUTORY_DISCOUNT_PERCENT
} from './discounts';

const senior = { type: 'Senior', idNumber: '12-3456', cardholderName: 'Juan Dela Cruz' };

describe('statutoryDiscountCentavos', () => {
	// 20% of N centavos is exactly N / 5, so the only interesting inputs are the
	// five residues mod 5. Nothing here can land on an exact half centavo.
	it.each([
		[0, 0],
		[1, 0], // 0.2 -> 0
		[2, 0], // 0.4 -> 0
		[3, 1], // 0.6 -> 1
		[4, 1], // 0.8 -> 1
		[5, 1],
		[12345, 2469],
		[99999, 20000], // 19999.8 -> 20000
		[160000, 32000] // the worked example: 1,600.00 -> 320.00
	])('%i centavos gross gives %i centavos discount', (gross, expected) => {
		expect(statutoryDiscountCentavos(gross)).toBe(expected);
	});

	it('never exceeds the gross amount', () => {
		for (let gross = 0; gross < 2000; gross++) {
			expect(statutoryDiscountCentavos(gross)).toBeLessThanOrEqual(gross);
		}
	});

	it('is always a whole number of centavos', () => {
		for (let gross = 0; gross < 2000; gross++) {
			expect(Number.isInteger(statutoryDiscountCentavos(gross))).toBe(true);
		}
	});

	it('stays within half a centavo of a true 20%', () => {
		for (let gross = 0; gross < 5000; gross++) {
			expect(Math.abs(statutoryDiscountCentavos(gross) - gross / 5)).toBeLessThanOrEqual(0.5);
		}
	});

	it('refuses nonsense rather than propagating it', () => {
		expect(statutoryDiscountCentavos(-100)).toBe(0);
		expect(statutoryDiscountCentavos(1.5)).toBe(0);
		expect(statutoryDiscountCentavos(NaN)).toBe(0);
		expect(statutoryDiscountCentavos(1e20)).toBe(0);
	});
});

describe('resolveDiscount — None', () => {
	it('zeroes every field and ignores whatever else was sent', () => {
		const result = resolveDiscount(160000, {
			type: 'None',
			idNumber: '12-3456',
			cardholderName: 'Juan Dela Cruz',
			amountCentavos: 999999,
			reason: 'ignore me'
		});
		expect(result).toEqual({
			ok: true,
			value: {
				discountType: 'None',
				discountCentavos: 0,
				discountReason: '',
				discountIdNumber: '',
				discountCardholderName: '',
				discountRatePercent: 0
			}
		});
	});

	it('treats a missing type as None', () => {
		const result = resolveDiscount(160000, {});
		expect(result.ok && result.value.discountType).toBe('None');
	});

	it('rejects a type that is not on the list', () => {
		const result = resolveDiscount(160000, { type: 'Senior Citizen' });
		expect(result).toMatchObject({ ok: false, field: 'type' });
	});
});

describe('resolveDiscount — statutory', () => {
	it('computes 20% of gross', () => {
		const result = resolveDiscount(160000, senior);
		expect(result.ok && result.value.discountCentavos).toBe(32000);
		expect(result.ok && result.value.discountRatePercent).toBe(STATUTORY_DISCOUNT_PERCENT);
	});

	// The crux of the feature: the amount is computed, never accepted.
	it('ignores a tampered amount from the client', () => {
		const result = resolveDiscount(160000, { ...senior, amountCentavos: 160000 });
		expect(result.ok && result.value.discountCentavos).toBe(32000);
	});

	it('ignores a client-supplied reason and derives its own', () => {
		const result = resolveDiscount(160000, { ...senior, reason: 'whatever they typed' });
		expect(result.ok && result.value.discountReason).toBe(
			'Senior Citizen 20% - Juan Dela Cruz (ID 12-3456)'
		);
	});

	it('requires an ID number', () => {
		const result = resolveDiscount(160000, { ...senior, idNumber: '   ' });
		expect(result).toMatchObject({ ok: false, field: 'idNumber' });
	});

	it('requires a cardholder name', () => {
		const result = resolveDiscount(160000, { ...senior, cardholderName: '' });
		expect(result).toMatchObject({ ok: false, field: 'cardholderName' });
	});

	it('names the right statute in the missing-ID message', () => {
		const asSenior = resolveDiscount(160000, { type: 'Senior' });
		const asPwd = resolveDiscount(160000, { type: 'PWD' });
		expect(!asSenior.ok && asSenior.message).toContain('Senior Citizen');
		expect(!asPwd.ok && asPwd.message).toContain('PWD');
	});

	it('accepts the ID layouts different LGUs actually issue', () => {
		for (const idNumber of ['12-3456', 'RCX-2019-0042', '04 4501 0123', 'OSCA#1234', '063/2011']) {
			expect(resolveDiscount(160000, { ...senior, idNumber }).ok).toBe(true);
		}
	});

	it('caps the free-text lengths', () => {
		expect(resolveDiscount(160000, { ...senior, idNumber: 'A'.repeat(41) })).toMatchObject({
			ok: false,
			field: 'idNumber'
		});
		expect(resolveDiscount(160000, { ...senior, cardholderName: 'A'.repeat(121) })).toMatchObject({
			ok: false,
			field: 'cardholderName'
		});
	});

	it('still captures the ID on a zero-gross transaction', () => {
		// Refusing this would be baffling at the counter, and the claim is real
		// even when there is nothing to discount.
		const result = resolveDiscount(0, senior);
		expect(result.ok).toBe(true);
		expect(result.ok && result.value.discountCentavos).toBe(0);
		expect(result.ok && result.value.discountIdNumber).toBe('12-3456');
	});

	it('trims what was typed', () => {
		const result = resolveDiscount(160000, {
			type: 'PWD',
			idNumber: '  12-3456  ',
			cardholderName: '  Maria Santos  '
		});
		expect(result.ok && result.value.discountIdNumber).toBe('12-3456');
		expect(result.ok && result.value.discountCardholderName).toBe('Maria Santos');
	});
});

describe('resolveDiscount — Other', () => {
	const other = { type: 'Other', amountCentavos: 50000, reason: 'Company account' };

	it('accepts a range-checked amount with a reason', () => {
		const result = resolveDiscount(160000, other);
		expect(result.ok && result.value.discountCentavos).toBe(50000);
		expect(result.ok && result.value.discountReason).toBe('Company account');
		expect(result.ok && result.value.discountRatePercent).toBe(0);
	});

	it('rejects an amount greater than gross', () => {
		expect(resolveDiscount(160000, { ...other, amountCentavos: 160001 })).toMatchObject({
			ok: false,
			field: 'amount'
		});
	});

	it('allows a full waiver, which is a real thing a charity case needs', () => {
		const result = resolveDiscount(160000, { ...other, amountCentavos: 160000 });
		expect(result.ok && result.value.discountCentavos).toBe(160000);
	});

	it('rejects an unsafe integer rather than letting it through as a number', () => {
		expect(resolveDiscount(160000, { ...other, amountCentavos: 1e20 })).toMatchObject({
			ok: false,
			field: 'amount'
		});
	});

	it('rejects a negative amount', () => {
		expect(resolveDiscount(160000, { ...other, amountCentavos: -1 })).toMatchObject({
			ok: false,
			field: 'amount'
		});
	});

	it('requires a reason', () => {
		expect(resolveDiscount(160000, { ...other, reason: '  ' })).toMatchObject({
			ok: false,
			field: 'reason'
		});
	});

	it('does not carry an ID number', () => {
		const result = resolveDiscount(160000, { ...other, idNumber: '12-3456' });
		expect(result.ok && result.value.discountIdNumber).toBe('');
	});
});

describe('readDiscountType', () => {
	it('uses a stored type when there is one', () => {
		expect(readDiscountType({ discountType: 'PWD', discountCentavos: 32000 })).toBe('PWD');
	});

	// The important one: never reconstruct a statutory claim the laboratory
	// cannot substantiate with a captured ID.
	it('reports a legacy discount as ad-hoc, never as statutory', () => {
		expect(readDiscountType({ discountCentavos: 32000, discountReason: 'Senior' })).toBe('Other');
		expect(readDiscountType({ discountCentavos: 32000, discountReason: 'PWD discount' })).toBe(
			'Other'
		);
	});

	it('reports no discount when a legacy document has none', () => {
		expect(readDiscountType({ discountCentavos: 0 })).toBe('None');
		expect(readDiscountType({})).toBe('None');
		expect(readDiscountType(null)).toBe('None');
	});

	it('ignores a stored type that is not on the list', () => {
		expect(readDiscountType({ discountType: 'Senior Citizen', discountCentavos: 1 })).toBe('Other');
	});
});
