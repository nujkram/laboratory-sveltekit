// Paper presets taken verbatim from the client's Word templates in /docs
// (w:sectPr -> pgSz / pgMar). `content` is the printable width, i.e. the page
// width minus both side margins — the report sheet is laid out at exactly that
// width in physical units so a printout lands 1:1 on the paper form.
//
//   a4Hema    HEMA FORM.docx
//   a4        RU FORM.docx, Anti-HBs FORM.docx
//   letter    RS FORM.docx + the rapid-test serology forms
//   longBond  TSH / T3 T4 / PSA forms (Philippine long bond, 8.5in x 13in)
//   chemLand  CHEM FORM - YSA.docx (landscape)
export const papers = {
	a4Hema: {
		size: '8.27in 11.69in',
		margin: '1in 0.75in',
		content: '6.77in',
		base: '10pt',
		head: '8pt'
	},
	a4: { size: '8.27in 11.69in', margin: '1in', content: '6.27in', base: '10pt', head: '8pt' },
	letter: { size: '8.5in 11in', margin: '1in', content: '6.5in', base: '10pt', head: '8pt' },
	longBond: {
		size: '8.5in 13in',
		margin: '0.25in 1in 1in 1in',
		content: '6.5in',
		base: '12pt',
		head: '10pt'
	},
	chemLand: { size: '11in 8.5in', margin: '0.5in', content: '10in', base: '10pt', head: '8pt' },
	// Half-letter charge slip. Not from a Word template — this is the new
	// laboratory transaction receipt, sized so two print per letter sheet on an
	// ordinary office printer (no slip printer needed).
	receipt: { size: '5.5in 8.5in', margin: '0.3in', content: '4.9in', base: '9pt', head: '7pt' }
};

/**
 * Falls back to letter so an unknown key can never break printing.
 * @param {keyof typeof papers | string} [name]
 */
export function getPaper(name) {
	return papers[/** @type {keyof typeof papers} */ (name)] ?? papers.letter;
}
