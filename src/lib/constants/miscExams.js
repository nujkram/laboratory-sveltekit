// One entry per Miscellaneous exam, transcribed from the client's Word
// templates in /docs. Titles, brand names, reference values and paper sizes are
// verbatim — these forms are handed to doctors and were rejected once already
// for not matching the paper.
//
// Two shapes of form:
//   kind: 'rapid'  — qualitative rapid tests. Centred title, the kit brand in
//                    parentheses, an optional NV line, and one or more result
//                    rows. Printed on letter (A4 for Anti-HBs), blue banner.
//   kind: 'panel'  — quantitative analyser runs (thyroid, PSA). A NORMAL RANGE
//                    table over an ANALYSIS / RESULT table, on long bond with
//                    the pale banner and the analyser credit in the footer.
//                    A single-analyte panel (TSH alone) and a multi-analyte one
//                    (TSH + FT3 + FT4) are the same component, different rows.

const SCREENING_NOTE =
	"This is a screening procedure. Confirmatory testing is needed to provide definitive diagnosis. Correlation with patient's medical history and clinical profile is needed for proper interpretation of results.";

const RAPID = { kind: 'rapid', paper: 'letter', banner: 'bg-report-misc', header: 'compact' };
const PANEL = {
	kind: 'panel',
	paper: 'longBond',
	banner: 'bg-report-miscQuant',
	header: 'tall',
	analyzer: true
};

/** Reference ranges are per panel — see the note in miscExams.md / the plan. */
const TSH_RANGE = { label: 'TSH', field: 'tsh', unit: 'mIU/L', range: '0.30 - 4.20  mIU/L' };

export const miscExams = {
	'Anti - HAV': {
		...RAPID,
		title: 'ANTI - HAV DETERMINATION',
		method: '(ABBOTT\u00ae Bioline HAV IgG/IgM Rapid Test)',
		rows: [
			{ label: 'IgM', field: 'igm' },
			{ label: 'IgG', field: 'igg' }
		]
	},
	'Anti - HBs': {
		...RAPID,
		paper: 'a4',
		title: 'ANTI - HBs',
		method: '(Vaxpert)',
		rows: [{ field: 'result' }]
	},
	ASOT: {
		...RAPID,
		title: 'ANTISTREPTOLYSIN O TITER',
		method: '(Dialab)',
		nv: 'NV:   200 IU / mL',
		rows: [{ field: 'result' }]
	},
	CRP: {
		...RAPID,
		title: 'C - REACTIVE PROTEIN',
		method: '(Dialab)',
		nv: 'NV:   6 mg / L',
		rows: [{ field: 'result' }]
	},
	'Dengue Duo': {
		...RAPID,
		title: 'DENGUE IMMUNOCHROMATOGRAPHIC RAPID TEST',
		method: '(ABBOTT\u00ae Bioline Dengue Duo NS1 + Ab Combo)',
		rows: [
			{ label: 'NS1', field: 'ns1' },
			{ label: 'IgM', field: 'igm' },
			{ label: 'IgG', field: 'igg' }
		]
	},
	HBsAg: {
		...RAPID,
		title: 'HEPATITIS B SURFACE ANTIGEN',
		method: '(INTEC\u00ae)',
		rows: [{ field: 'result' }],
		screeningNote: SCREENING_NOTE
	},
	'H.Pylori': {
		...RAPID,
		title: 'H. PYLORI',
		method: '(Dialab)',
		rows: [{ field: 'result' }]
	},
	'Pregnancy Test': {
		...RAPID,
		title: 'QUALITATIVE TEST FOR HCG',
		method: '(RIGHTSIGN\u00ae)',
		rows: [{ field: 'result' }]
	},
	RPR: {
		...RAPID,
		title: 'One Step Anti - TP (Treponema pallidum/Syphilis) Test',
		method: '(TRIMERA\u00ae)',
		rows: [{ field: 'result' }],
		screeningNote: SCREENING_NOTE
	},

	TSH: { ...PANEL, panel: [TSH_RANGE] },
	'TSH, FT4': {
		...PANEL,
		panel: [TSH_RANGE, { label: 'FT4', field: 'ft4', unit: 'pmol/L', range: '10 - 20   pmol/L' }]
	},
	'TSH, FT3, FT4': {
		...PANEL,
		panel: [
			TSH_RANGE,
			{ label: 'FT3', field: 'ft3', unit: 'pmol/L', range: '2.80 - 7.10 pmol/L' },
			{ label: 'FT4', field: 'ft4', unit: 'pmol/L', range: '10.00 - 20.00   pmol/L' }
		]
	},
	'TSH, T3, T4': {
		...PANEL,
		panel: [
			TSH_RANGE,
			{ label: 'T3', field: 't3', unit: 'nmol/L', range: '1.40 - 3.00 nmol/L' },
			{ label: 'T4', field: 't4', unit: 'nmol/L', range: '70.00 - 185.00 nmol/L' }
		]
	},
	'T3, T4': {
		...PANEL,
		panel: [
			{ label: 'T3', field: 't3', unit: 'nmol/L', range: '1.23 - 3.07 nmol/L' },
			{ label: 'T4', field: 't4', unit: 'nmol/L', range: '66 - 181 nmol/L' }
		]
	},
	PSA: {
		...PANEL,
		panel: [
			{
				label: 'TOTAL PSA',
				rangeLabel: 'TPSA',
				field: 'psa',
				unit: 'ng/mL',
				range: '<4.00   ng/mL'
			}
		]
	}
};

/** No template was supplied for Gram's Stain / KOH — they keep the generic form. */
export const defaultMiscExam = {
	...RAPID,
	title: '',
	method: '',
	rows: [{ field: 'result' }]
};

/** @param {keyof typeof miscExams | string} [exam] */
export function getMiscExam(exam) {
	return miscExams[/** @type {keyof typeof miscExams} */ (exam)] ?? defaultMiscExam;
}

/** Every result field any exam can ask for, for the create/update form. */
export const miscResultFields = [
	'result',
	'ns1',
	'igm',
	'igg',
	'tsh',
	'ft3',
	'ft4',
	't3',
	't4',
	'psa'
];

export const analyzerOptions = ['Anbio', 'Finecare'];
