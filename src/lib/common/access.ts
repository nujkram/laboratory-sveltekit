import { ADMIN_ROLE, CASHIER_ROLE } from './utils';

/**
 * Who may open which part of the app.
 *
 * ONE map, read by both the server guard in hooks.server.ts and the sidebar, so
 * the navigation can never offer a page the server will refuse — and, more
 * importantly, so hiding a link is never mistaken for protecting a page.
 *
 * The reasoning behind the shape:
 *  - A cashier gets the counter and the transactions list, and nothing clinical.
 *    They take money; they have no need for patient charts or results.
 *  - A cashier does NOT get /laboratory/request, which loads the full patient
 *    list to build a request — that would hand back the patient data the rule
 *    above withholds.
 *  - Lab staff can raise a request but cannot open the cashier counter, so the
 *    person who creates a charge is never the person who settles it.
 */

export const MEDTECH_ROLE = 'Medical Technologist';
export const PATHOLOGIST_ROLE = 'Pathologist';

/** Everyone who works on the clinical side. */
const CLINICAL = [ADMIN_ROLE, MEDTECH_ROLE, PATHOLOGIST_ROLE];

type Access = string[] | 'public' | 'authenticated';

/**
 * First match wins, so more specific prefixes must come first. `/` is matched
 * exactly; everything else matches the path itself or anything beneath it.
 */
const RULES: Array<{ prefix: string; allow: Access }> = [
	{ prefix: '/auth', allow: 'public' },
	// before the broader /laboratory rule
	{ prefix: '/laboratory/request', allow: CLINICAL },
	{ prefix: '/laboratory', allow: [...CLINICAL, CASHIER_ROLE] },
	{ prefix: '/cashier', allow: [ADMIN_ROLE, CASHIER_ROLE] },
	{ prefix: '/patients', allow: CLINICAL },
	{ prefix: '/record', allow: CLINICAL },
	{ prefix: '/users', allow: [ADMIN_ROLE] },
	{ prefix: '/settings', allow: [ADMIN_ROLE] },
	// the offline outbox — anyone who can create something may review their queue
	{ prefix: '/pending', allow: 'authenticated' },
	{ prefix: '/', allow: CLINICAL }
];

/**
 * The same idea for the JSON API. Pages being guarded is not enough on its own:
 * `/api/admin/prefetch` alone returns 500 patients and their records, so a
 * cashier who was merely kept off /patients could still have fetched the lot.
 *
 * Ordered like RULES — most specific prefix first.
 */
const API_RULES: Array<{ prefix: string; allow: Access }> = [
	{ prefix: '/api/auth/login', allow: 'public' },
	{ prefix: '/api/auth/logout', allow: 'authenticated' },

	// changing your OWN password; the endpoint itself checks admin for resets
	{ prefix: '/api/admin/user/password', allow: 'authenticated' },
	// reference lists the record forms need to populate their selects
	{ prefix: '/api/admin/user/med-tech', allow: CLINICAL },
	{ prefix: '/api/admin/user/pathologist', allow: CLINICAL },
	{ prefix: '/api/admin/user', allow: [ADMIN_ROLE] },

	{ prefix: '/api/admin/role', allow: [ADMIN_ROLE] },
	{ prefix: '/api/admin/settings', allow: [ADMIN_ROLE] },

	{ prefix: '/api/admin/patient', allow: CLINICAL },
	{ prefix: '/api/admin/record', allow: CLINICAL },
	{ prefix: '/api/admin/dashboard', allow: CLINICAL },
	// bulk patients + records for offline use — clinical only, emphatically
	{ prefix: '/api/admin/prefetch', allow: CLINICAL },

	{ prefix: '/api/admin/lab-test/update', allow: [ADMIN_ROLE] },
	{ prefix: '/api/admin/lab-test', allow: CLINICAL },

	{ prefix: '/api/admin/lab-transaction/pay', allow: [ADMIN_ROLE, CASHIER_ROLE] },
	{ prefix: '/api/admin/lab-transaction/cancel', allow: [ADMIN_ROLE] },
	{ prefix: '/api/admin/lab-transaction/insert', allow: CLINICAL },
	{ prefix: '/api/admin/lab-transaction', allow: [...CLINICAL, CASHIER_ROLE] }
];

/**
 * May this user call this endpoint? An unlisted `/api/` path falls through to
 * administrators only, so a new endpoint is closed by default rather than open
 * to everyone the day it is added.
 */
export function canCallApi(user: any, pathname: string) {
	const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
	const rule = API_RULES.find(
		({ prefix }) => path === prefix || path.startsWith(`${prefix}/`)
	);
	const allow: Access = rule ? rule.allow : [ADMIN_ROLE];

	if (allow === 'public') return true;
	if (!user) return false;
	if (allow === 'authenticated') return true;
	return allow.includes(user.role);
}

function ruleFor(pathname: string) {
	const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
	return RULES.find(({ prefix }) =>
		prefix === '/' ? path === '/' : path === prefix || path.startsWith(`${prefix}/`)
	);
}

/** Is this path reachable without signing in? */
export function isPublicPath(pathname: string) {
	return ruleFor(pathname)?.allow === 'public';
}

/**
 * May this user open this path? Unknown paths are allowed through so a genuine
 * 404 still reads as a 404 rather than a permission error.
 */
export function canView(user: any, pathname: string) {
	const rule = ruleFor(pathname);
	if (!rule) return true;
	if (rule.allow === 'public') return true;
	if (!user) return false;
	if (rule.allow === 'authenticated') return true;
	return rule.allow.includes(user.role);
}

/**
 * Where to send someone who lands somewhere they may not go. A cashier has no
 * dashboard, so bouncing them to `/` would loop.
 */
export function landingFor(user: any) {
	if (!user) return '/auth/login';
	return canView(user, '/') ? '/' : canView(user, '/cashier') ? '/cashier' : '/pending';
}
