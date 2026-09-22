import { describe, expect, it } from 'vitest';
import { canCallApi, canView, isPublicPath, landingFor } from './access';
import { ADMIN_ROLE, CASHIER_ROLE, MANAGER_ROLE } from './utils';

const admin = { role: ADMIN_ROLE };
const cashier = { role: CASHIER_ROLE };
const manager = { role: MANAGER_ROLE };
const medtech = { role: 'Medical Technologist' };

/**
 * The access map is the only thing standing between a role and a page, and it
 * is read by both the server guard and the sidebar. A rule reordered by
 * accident is silent — first match wins — so the matrix is asserted rather than
 * eyeballed.
 */
describe('manager — what they can reach', () => {
	it.each(['/reports', '/prices', '/laboratory', '/laboratory/transactions'])(
		'may open %s',
		(path) => {
			expect(canView(manager, path)).toBe(true);
		}
	);

	// The point of the role: reads the money, never moves it, and never sees a
	// patient chart.
	it.each([
		'/',
		'/patients',
		'/record',
		'/cashier',
		'/laboratory/request',
		'/laboratory/request/new',
		'/users',
		'/settings'
	])('may NOT open %s', (path) => {
		expect(canView(manager, path)).toBe(false);
	});

	it.each([
		'/api/admin/lab-transaction',
		'/api/admin/lab-transaction/report',
		'/api/admin/lab-test',
		'/api/admin/lab-test/update'
	])('may call %s', (path) => {
		expect(canCallApi(manager, path)).toBe(true);
	});

	it.each([
		'/api/admin/lab-transaction/insert',
		'/api/admin/lab-transaction/pay',
		'/api/admin/lab-transaction/discount',
		'/api/admin/lab-transaction/cancel',
		'/api/admin/patient',
		'/api/admin/record',
		'/api/admin/prefetch',
		'/api/admin/dashboard',
		'/api/admin/user',
		'/api/admin/settings'
	])('may NOT call %s', (path) => {
		expect(canCallApi(manager, path)).toBe(false);
	});

	// /laboratory/request sits before /laboratory in the table. If those two are
	// ever reordered, a manager silently gains the full patient list.
	it('is kept off the request builder by rule order, not by luck', () => {
		expect(canView(manager, '/laboratory/request/new')).toBe(false);
		expect(canView(manager, '/laboratory/transactions')).toBe(true);
	});

	it('lands on the reports, having neither a dashboard nor a counter', () => {
		expect(landingFor(manager)).toBe('/reports');
	});
});

describe('the other roles are unchanged by the manager rules', () => {
	it('a cashier still cannot see the reports or the price list', () => {
		expect(canView(cashier, '/reports')).toBe(false);
		expect(canView(cashier, '/prices')).toBe(false);
		expect(canCallApi(cashier, '/api/admin/lab-transaction/report')).toBe(false);
		expect(canCallApi(cashier, '/api/admin/lab-test/update')).toBe(false);
	});

	it('a cashier keeps the counter and the list', () => {
		expect(canView(cashier, '/cashier')).toBe(true);
		expect(canView(cashier, '/laboratory/transactions')).toBe(true);
		expect(canCallApi(cashier, '/api/admin/lab-transaction/pay')).toBe(true);
		expect(landingFor(cashier)).toBe('/cashier');
	});

	it('clinical staff keep the request builder and lose nothing', () => {
		expect(canView(medtech, '/laboratory/request/new')).toBe(true);
		expect(canView(medtech, '/patients')).toBe(true);
		expect(canCallApi(medtech, '/api/admin/lab-test')).toBe(true);
		expect(landingFor(medtech)).toBe('/');
	});

	it('clinical staff are not quietly given the reports', () => {
		expect(canView(medtech, '/reports')).toBe(false);
		expect(canCallApi(medtech, '/api/admin/lab-transaction/report')).toBe(false);
	});

	it('a medical technologist can no longer change prices', () => {
		// lab-test/update was already admin-only; widening it to managers must not
		// have widened it to everyone who can read the catalog.
		expect(canCallApi(medtech, '/api/admin/lab-test/update')).toBe(false);
	});

	it('an administrator reaches everything that was added', () => {
		for (const path of ['/reports', '/prices', '/laboratory', '/cashier', '/users']) {
			expect(canView(admin, path)).toBe(true);
		}
		expect(canCallApi(admin, '/api/admin/lab-transaction/report')).toBe(true);
		expect(canCallApi(admin, '/api/admin/lab-test/update')).toBe(true);
	});
});

describe('the guard fails closed', () => {
	it('refuses everyone who is not signed in', () => {
		for (const path of ['/reports', '/prices', '/laboratory']) {
			expect(canView(null, path)).toBe(false);
		}
		expect(canCallApi(null, '/api/admin/lab-transaction/report')).toBe(false);
		expect(landingFor(null)).toBe('/auth/login');
	});

	it('closes an unlisted API path to everyone but an administrator', () => {
		expect(canCallApi(manager, '/api/admin/something-new')).toBe(false);
		expect(canCallApi(cashier, '/api/admin/something-new')).toBe(false);
		expect(canCallApi(admin, '/api/admin/something-new')).toBe(true);
	});

	it('refuses a role that is not in the map at all', () => {
		const stranger = { role: 'Janitor' };
		expect(canView(stranger, '/reports')).toBe(false);
		expect(canCallApi(stranger, '/api/admin/lab-transaction')).toBe(false);
	});

	it('keeps sign-in public and nothing else', () => {
		expect(isPublicPath('/auth/login')).toBe(true);
		expect(isPublicPath('/reports')).toBe(false);
		expect(isPublicPath('/prices')).toBe(false);
	});

	// A trailing slash must not slip past a prefix match.
	it('normalises a trailing slash', () => {
		expect(canView(cashier, '/reports/')).toBe(false);
		expect(canView(manager, '/reports/')).toBe(true);
	});
});
