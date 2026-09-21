import type { Db } from 'mongodb';
import { id } from '$lib/common/utils';

/**
 * The laboratory test catalog, transcribed from `docs/laboratory_request_form.md`
 * — the client's paper Laboratory Request Form, which is the source of truth for
 * codes, names and prices.
 *
 * This array only SEEDS the `lab_tests` collection. Once a code exists in the
 * database the database wins: `ensureLabTests` never overwrites a row, so a
 * price an administrator edits in the app survives every redeploy. Runtime code
 * must read `lab_tests`, never this array, so there is exactly one live price.
 *
 * Prices are integer centavos (see `$lib/utils/currency`).
 *
 * Two deviations from the document, both deliberate:
 *  - The 12 placeholder rows (428–431, 434, 435, 437, 439, 444, 450, 453, 461,
 *    printed as "—") carry no test and no price, so they are not seeded.
 *  - Codes 423–427 (ESR, Clotting Time, Bleeding Time, PT, APTT) fall outside
 *    every code range the document's "Sections" list declares — its Hematology
 *    range stops at 422. They are hematology/coagulation tests, so they are
 *    filed under Hematology rather than left without a section.
 *
 * Codes 417 (Chloride), 447 (TGM) and 448 (Sem. Analysis) are marked in the
 * document as "not available" / "(N/A)". They are seeded with their price but
 * `isAvailable: false`, so they stay visible for reference and cannot be ordered.
 */
export type LabTestSeed = {
	code: number;
	name: string;
	section: string;
	priceCentavos: number;
	/** omitted means true */
	isAvailable?: boolean;
};

/** Section order as the paper form prints them — drives the picker's grouping. */
export const LAB_TEST_SECTIONS = [
	'Blood Chemistry',
	'Lipid Profile Exam',
	'Liver Profile',
	'Electrolyte Test',
	'Hematology',
	'S.O. Histopath',
	'Serology and Miscellaneous',
	'Clinical Microscopy',
	'Parasitology',
	'Thyroid / Hormone / Other Tests'
];

export const LAB_TEST_CATALOG: LabTestSeed[] = [
	{ code: 401, name: "BS (FBS)"                          , section: "Blood Chemistry"                 , priceCentavos:  12000 },
	{ code: 402, name: "BS (rbs, 2*ppbs, 5*ppbs)"          , section: "Blood Chemistry"                 , priceCentavos:  12000 },
	{ code: 403, name: "Creatinine"                        , section: "Blood Chemistry"                 , priceCentavos:  16000 },
	{ code: 404, name: "BUN"                               , section: "Blood Chemistry"                 , priceCentavos:  16000 },
	{ code: 405, name: "Uric Acid"                         , section: "Blood Chemistry"                 , priceCentavos:  16500 },
	{ code: 406, name: "Cholesterol"                       , section: "Lipid Profile Exam"              , priceCentavos:  16500 },
	{ code: 407, name: "Triglycerides"                     , section: "Lipid Profile Exam"              , priceCentavos:  19500 },
	{ code: 408, name: "HDL-LDL"                           , section: "Lipid Profile Exam"              , priceCentavos:  20000 },
	{ code: 409, name: "SGOT"                              , section: "Liver Profile"                   , priceCentavos:  21500 },
	{ code: 410, name: "SGPT"                              , section: "Liver Profile"                   , priceCentavos:  21500 },
	{ code: 411, name: "Glucosedrink Trutol"               , section: "Liver Profile"                   , priceCentavos:  20000 },
	{ code: 412, name: "OGCT - Challenge Test"             , section: "Liver Profile"                   , priceCentavos:  80000 },
	{ code: 413, name: "OGTT - Tolerance Test"             , section: "Liver Profile"                   , priceCentavos:  80000 },
	{ code: 414, name: "Sodium (Na)"                       , section: "Electrolyte Test"                , priceCentavos:  27500 },
	{ code: 415, name: "Potassium (K)"                     , section: "Electrolyte Test"                , priceCentavos:  27500 },
	{ code: 416, name: "Calcium"                           , section: "Electrolyte Test"                , priceCentavos:  27500 },
	{ code: 417, name: "Chloride"                          , section: "Electrolyte Test"                , priceCentavos:  21000, isAvailable: false },
	{ code: 418, name: "CBC"                               , section: "Hematology"                      , priceCentavos:  15000 },
	{ code: 419, name: "APC"                               , section: "Hematology"                      , priceCentavos:  10000 },
	{ code: 420, name: "Blood Typing"                      , section: "Hematology"                      , priceCentavos:   9000 },
	{ code: 421, name: "RH Typing"                         , section: "Hematology"                      , priceCentavos:  10000 },
	{ code: 422, name: "Hemoglobin/Hematocrit"             , section: "Hematology"                      , priceCentavos:  16000 },
	{ code: 423, name: "ESR"                               , section: "Hematology"                      , priceCentavos:  16000 },
	{ code: 424, name: "Clotting Time"                     , section: "Hematology"                      , priceCentavos:   9000 },
	{ code: 425, name: "Bleeding Time"                     , section: "Hematology"                      , priceCentavos:   9000 },
	{ code: 426, name: "PT"                                , section: "Hematology"                      , priceCentavos:  55000 },
	{ code: 427, name: "APTT"                              , section: "Hematology"                      , priceCentavos:  55000 },
	{ code: 432, name: "PBS+CBC/APC (FIX)"                 , section: "S.O. Histopath"                  , priceCentavos: 100000 },
	{ code: 433, name: "Pap's Smear - A"                   , section: "S.O. Histopath"                  , priceCentavos:  50000 },
	{ code: 436, name: "H-Pylori"                          , section: "S.O. Histopath"                  , priceCentavos:  70000 },
	{ code: 438, name: "Preg. Test - Serum"                , section: "Serology and Miscellaneous"      , priceCentavos:  25000 },
	{ code: 440, name: "Hepatitis B Surface Antigen - B"   , section: "Serology and Miscellaneous"      , priceCentavos:  25000 },
	{ code: 441, name: "Anti - Hbs"                        , section: "Serology and Miscellaneous"      , priceCentavos:  37500 },
	{ code: 442, name: "Anti - Streptolysin O Titer (ASOT)", section: "Serology and Miscellaneous"      , priceCentavos:  40000 },
	{ code: 443, name: "Succeeding Dilution if (+)"        , section: "Serology and Miscellaneous"      , priceCentavos:   7500 },
	{ code: 445, name: "C - Reactive Protein"              , section: "Serology and Miscellaneous"      , priceCentavos:  40000 },
	{ code: 446, name: "Succeeding Dilution if (+)"        , section: "Serology and Miscellaneous"      , priceCentavos:   7500 },
	{ code: 447, name: "TGM"                               , section: "Serology and Miscellaneous"      , priceCentavos:    300, isAvailable: false },
	{ code: 448, name: "Sem. Analysis"                     , section: "Clinical Microscopy"             , priceCentavos:  26000, isAvailable: false },
	{ code: 449, name: "Staining Reg. - Grams"             , section: "Clinical Microscopy"             , priceCentavos:  25000 },
	{ code: 451, name: "Staining Reg. - KOH"               , section: "Clinical Microscopy"             , priceCentavos:  25000 },
	{ code: 452, name: "Routine Urinalysis"                , section: "Clinical Microscopy"             , priceCentavos:  11000 },
	{ code: 457, name: "Routine Stool Exam"                , section: "Parasitology"                    , priceCentavos:  11000 },
	{ code: 458, name: "TSH, T3, T4 (FIX)"                 , section: "Thyroid / Hormone / Other Tests" , priceCentavos: 150000 },
	{ code: 459, name: "Anti - Hav"                        , section: "Thyroid / Hormone / Other Tests" , priceCentavos:  65000 },
	{ code: 460, name: "TSH, FT3, FT4 (FIX)"               , section: "Thyroid / Hormone / Other Tests" , priceCentavos: 160000 },
	{ code: 462, name: "Hba1C"                             , section: "Thyroid / Hormone / Other Tests" , priceCentavos: 100000 },
	{ code: 463, name: "T3"                                , section: "Thyroid / Hormone / Other Tests" , priceCentavos:  70000 },
	{ code: 464, name: "T4"                                , section: "Thyroid / Hormone / Other Tests" , priceCentavos:  70000 },
	{ code: 465, name: "TSH"                               , section: "Thyroid / Hormone / Other Tests" , priceCentavos:  99000 },
	{ code: 466, name: "PSA"                               , section: "Thyroid / Hormone / Other Tests" , priceCentavos: 100000 },
	{ code: 467, name: "+ Dengue Duo"                      , section: "Thyroid / Hormone / Other Tests" , priceCentavos: 125000 },
	{ code: 469, name: "RPR"                               , section: "Thyroid / Hormone / Other Tests" , priceCentavos:  25000 },
	{ code: 470, name: "FT3"                               , section: "Thyroid / Hormone / Other Tests" , priceCentavos:  80000 },
	{ code: 471, name: "FT4"                               , section: "Thyroid / Hormone / Other Tests" , priceCentavos:  80000 },
	{ code: 472, name: "Occult Blood w/ Fecalysis"         , section: "Thyroid / Hormone / Other Tests" , priceCentavos:  61000 },
	{ code: 473, name: "Extraction Fee"                    , section: "Thyroid / Hormone / Other Tests" , priceCentavos:    500 }
];

/**
 * Insert any catalog code the database does not have yet. Idempotent and
 * non-destructive: existing rows are left exactly as they are, so edited prices
 * and deactivated tests are never clobbered. Safe to call on every cold start.
 */
export async function ensureLabTests(db: Db) {
	const LabTest = db.collection('lab_tests');
	const existing = await LabTest.find({}, { projection: { code: 1 } }).toArray();
	const have = new Set(existing.map((row: any) => row.code));

	const missing = LAB_TEST_CATALOG.filter((test) => !have.has(test.code));
	if (!missing.length) return 0;

	const now = new Date();
	try {
		await LabTest.insertMany(
			missing.map((test) => ({
				_id: id() as any,
				code: test.code,
				name: test.name,
				section: test.section,
				priceCentavos: test.priceCentavos,
				isAvailable: test.isAvailable !== false,
				isActive: true,
				created: now,
				createdBy: null,
				seededFrom: 'docs/laboratory_request_form.md'
			})),
			{ ordered: false }
		);
	} catch (error: any) {
		// 11000 = another instance seeded the same codes concurrently; the unique
		// index on `code` is doing its job and the rows we wanted now exist.
		if (error?.code !== 11000) throw error;
	}
	return missing.length;
}
