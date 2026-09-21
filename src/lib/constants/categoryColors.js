// Ties an on-screen category badge to the colour its printed report is banded
// with, so "Chemistry" on a list reads as the same department as the green
// banner on the Word form. The fills live in tailwind.config.cjs under
// `report.*`, lifted from the templates' w:shd values.
//
// The raw fills are banner colours, not UI colours — two of them are pure red
// and pure yellow. Used as a pill background they would be unreadable, so each
// badge shows the TRUE colour as a dot and sits on a soft tint of it. The
// opacities differ per colour because the fills differ wildly in lightness:
// #FBD4B4 is already pale and needs far more than #FF0000 to register. They
// must also be steps Tailwind actually generates — /15 is not one of them and
// silently produces no rule at all.
//
// Class strings are written out in full on purpose. Tailwind's JIT only keeps
// classes it can literally see in the source, so a computed
// `bg-report-${category}` would be purged and the badge would render unstyled.

/** @type {Record<string, {tint: string, dot: string}>} */
const BADGES = {
	Hematology: { tint: 'bg-report-hematology/10', dot: 'bg-report-hematology' },
	Chemistry: { tint: 'bg-report-chemistry/20', dot: 'bg-report-chemistry' },
	Urinalysis: { tint: 'bg-report-urinalysis/25', dot: 'bg-report-urinalysis' },
	// kept lighter than the rest: its fill is already pale, so a stronger tint
	// swallows the dot that is meant to show the exact banner colour
	Parasitology: { tint: 'bg-report-parasitology/30', dot: 'bg-report-parasitology' },
	Miscellaneous: { tint: 'bg-report-misc/20', dot: 'bg-report-misc' }
};

// Categories come from the `record_categories` collection, so one can be added
// that has no printed form yet — fall back to a neutral pill rather than none.
const FALLBACK = { tint: 'bg-line/60', dot: 'bg-muted' };

/** @param {string | null | undefined} category */
export function categoryBadge(category) {
	return (category && BADGES[category]) || FALLBACK;
}

export const categoryBadgeBase =
	'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-ink';
