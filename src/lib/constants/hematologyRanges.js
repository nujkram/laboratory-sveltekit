// Hematology report rows in paper-form order. `ref` is a plain string or
// { f, m } printed with bold "F:" / "M:" prefixes. Field names match the
// stored record fields (`lympocyte` is the record's real, misspelled key).
export const hematologyMainRows = [
	{
		label: 'Hemoglobin Concentration Mass:',
		field: 'hemoglobin',
		unit: 'gms./L',
		ref: { f: '120-150 gms./L', m: '130-170 gms./L' }
	},
	{
		label: 'Erythrocyte Volume Fraction:',
		field: 'erythrocyteVolume',
		unit: 'gms./L',
		ref: { f: '0.37-0.45 gms./L', m: '0.40-0.50 gms./L' }
	},
	{
		label: 'Erythrocyte Number Concentration:',
		field: 'erythrocyteNumber',
		unit: 'X10¹²/L',
		ref: { f: '4.0-5.0 X10¹²/L', m: '4.5-5.5 X10¹²/L' }
	},
	{
		label: 'Leukocyte Number Concentration:',
		field: 'leukocyteNumber',
		unit: 'X10⁹/L',
		ref: '5.0-10 X10⁹/L'
	}
];

export const leukocyteRows = [
	{ label: 'Neutrophil Number Fraction:', field: 'neutrophilNumber', ref: '0.60 - 0.70' },
	{ label: 'Segmenters:', field: 'segmenters', ref: '0.60 - 0.70' },
	{ label: 'Stab:', field: 'stab', ref: '0.02 - 0.06' },
	{ label: 'Eosinophil:', field: 'eosinophil', ref: '0.02 - 0.03' },
	{ label: 'Basophil:', field: 'basophil', ref: '0.00 - 0.01' },
	{
		label: 'Lymphocyte:',
		field: 'lympocyte',
		ref: 'Adult: 0.18 - 0.30',
		ref2: 'Infant: 0.22 - 0.40'
	},
	{ label: 'Monocyte:', field: 'monocyte', ref: '0.04 - 0.08' }
];

// The paper form's OTHERS box (red-cell indices).
export const cbcIndexRows = [
	{ label: 'MCV:', field: 'mcv', ref: '80.0-99.0 fL' },
	{ label: 'MCH:', field: 'mch', ref: '26.5-33.5 pg' },
	{ label: 'MCHC:', field: 'mchc', ref: '320-360 g/L' },
	{ label: 'RDW-CV:', field: 'rdwCv', ref: '10.0-15.0 %' },
	{ label: 'MPV:', field: 'mpv', ref: '7.0-11.0 fL' }
];
