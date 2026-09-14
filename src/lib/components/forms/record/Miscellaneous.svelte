<script>
	// @ts-nocheck
	// The exam chosen here decides which result fields are asked for and which
	// paper form gets printed. Both come from the same config
	// ($lib/constants/miscExams.js) so the entry form and the report cannot drift.
	import { miscExams, getMiscExam, analyzerOptions } from '$lib/constants/miscExams.js';

	export let exam = 'ROUTINE';
	export let specimen, result, remarks, others, analyzer, ns1, igm, igg, tsh, ft3, ft4, t3, t4, psa;

	const options = Object.keys(miscExams).concat(["Gram's Stain", 'KOH']).sort();

	// Bound values keyed by field name so the template can stay a single loop.
	$: values = { result, ns1, igm, igg, tsh, ft3, ft4, t3, t4, psa };
	$: cfg = getMiscExam(exam);
	$: fields =
		cfg.kind === 'panel'
			? cfg.panel.map((r) => ({ field: r.field, label: `${r.label} (${r.unit})` }))
			: cfg.rows.map((r) => ({ field: r.field, label: r.label ?? 'Result' }));

	function setField(name, value) {
		if (name === 'result') result = value;
		else if (name === 'ns1') ns1 = value;
		else if (name === 'igm') igm = value;
		else if (name === 'igg') igg = value;
		else if (name === 'tsh') tsh = value;
		else if (name === 'ft3') ft3 = value;
		else if (name === 'ft4') ft4 = value;
		else if (name === 't3') t3 = value;
		else if (name === 't4') t4 = value;
		else if (name === 'psa') psa = value;
	}
</script>

<div class="md:flex md:items-center mb-6">
	<div class="md:w-3/12">
		<label class="field-label" for="inline-exam"> Exam Desired </label>
	</div>
	<div class="md:w-5/12">
		<select
			id="inline-exam"
			name="exam"
			class="field"
			placeholder="Select an option"
			bind:value={exam}
		>
			{#each options as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>
</div>
<div class="md:flex md:items-center mb-6">
	<div class="md:w-3/12">
		<label class="field-label" for="inline-specimen"> Specimen </label>
	</div>
	<div class="md:w-5/12">
		<input
			class="field"
			id="inline-specimen"
			type="text"
			placeholder="Specimen"
			name="specimen"
			bind:value={specimen}
		/>
	</div>
</div>
{#if cfg.analyzer}
	<div class="md:flex md:items-center mb-6">
		<div class="md:w-3/12">
			<label class="field-label" for="inline-analyzer"> Analyzer </label>
		</div>
		<div class="md:w-5/12">
			<select id="inline-analyzer" name="analyzer" class="field" bind:value={analyzer}>
				{#each analyzerOptions as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>
		<div class="md:w-3/12">
			<h4 class="field-hint">Printed as the credit above "Noted By:"</h4>
		</div>
	</div>
{/if}
{#each fields as f (f.field)}
	<div class="md:flex md:items-center mb-6">
		<div class="md:w-3/12">
			<label class="field-label" for="inline-{f.field}">
				{f.label}
			</label>
		</div>
		<div class="md:w-5/12">
			<input
				class="field"
				id="inline-{f.field}"
				type="text"
				placeholder={f.label}
				name={f.field}
				value={values[f.field] ?? ''}
				on:input={(e) => setField(f.field, e.target.value)}
			/>
		</div>
		{#if cfg.kind === 'panel'}
			<div class="md:w-3/12">
				<h4 class="field-hint">{cfg.panel.find((r) => r.field === f.field)?.range}</h4>
			</div>
		{/if}
	</div>
{/each}
<div class="md:flex md:items-center mb-6">
	<div class="md:w-3/12">
		<label class="field-label" for="inline-remarks"> Remarks </label>
	</div>
	<div class="md:w-5/12">
		<input
			class="field"
			id="inline-remarks"
			type="text"
			placeholder="Remarks"
			name="remarks"
			bind:value={remarks}
		/>
	</div>
</div>
<div class="md:flex md:items-start mb-6">
	<div class="md:w-3/12">
		<label class="field-label" for="inline-notes"> Notes </label>
	</div>
	<div class="md:w-5/12">
		<textarea
			class="field"
			id="inline-notes"
			rows="3"
			cols="50"
			placeholder="Notes"
			name="others"
			bind:value={others}
		/>
	</div>
</div>
