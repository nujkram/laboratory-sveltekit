// Chemistry report rows, in paper-form order (app-only analytes appended in
// the same style). `ref` is a plain string, or { f, m } printed as bold
// "F:" / "M:" prefixes like the paper form. Values mirror the field hints in
// src/lib/components/forms/record/Chemistry.svelte.
export const chemistryRanges = [
	{ label: 'Fasting Blood Sugar', field: 'fastingBloodSugar', ref: '3.89 - 5.83 mmol/L' },
	{ label: 'Random Blood Sugar', field: 'randomBloodSugar', ref: '2.47 - 7.17 mmol/L' },
	{ label: '2hr Post Prandial', field: 'postPrandial', ref: 'Less than 7.8 mmol/L' },
	{ label: 'HbA1c', field: 'hba1c', ref: '4.5 - 6.3 %' },
	{ label: 'Urea', field: 'urea', ref: '2.8 - 7.2 mmol/L' },
	{ label: 'Creatinine', field: 'creatinine', ref: { f: '53-97 µmol/L', m: '80-115 µmol/L' } },
	{ label: 'Uric Acid', field: 'uricAcid', ref: { f: '137-363 µmol/L', m: '214-488 µmol/L' } },
	{ label: 'Cholesterol', field: 'cholesterol', ref: 'Up to 5.2 mmol/L' },
	{ label: 'Triglycerides', field: 'triglycerides', ref: 'Up to 2.28 mmol/L' },
	{ label: 'HDL - Cholesterol', field: 'hdlCholesterol', ref: 'Greater than 0.90 mmol/L' },
	{ label: 'LDL - Cholesterol', field: 'ldlCholesterol', ref: 'Less than 3.40 mmol/L' },
	{ label: 'SGOT/AST', field: 'sgotAst', ref: { f: 'up to 31 U/L', m: 'up to 37 U/L' } },
	{ label: 'SGPT/ALT', field: 'sgptAlt', ref: { f: 'up to 32 U/L', m: 'up to 42 U/L' } },
	{ label: 'Sodium', field: 'sodium', ref: '135 - 148 mmol/L' },
	{ label: 'Potassium', field: 'potassium', ref: '3.5 - 5.3 mmol/L' },
	{ label: 'Calcium', field: 'calcium', ref: '2.15 - 2.57 mmol/L' }
];
