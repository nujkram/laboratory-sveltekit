import { redirect } from '@sveltejs/kit';

// /laboratory is the section's nav target (SidebarItem matches on startsWith so
// the item stays active across the sub-routes); the daily list is its landing page.
export function load() {
	throw redirect(307, '/laboratory/transactions');
}
