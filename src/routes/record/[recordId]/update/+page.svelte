<script>
	// @ts-nocheck
	import { fade } from 'svelte/transition';
	import Chemistry from '$lib/components/forms/record/Chemistry.svelte';
	import Hematology from '$lib/components/forms/record/Hematology.svelte';
	import Miscellaneous from '$lib/components/forms/record/Miscellaneous.svelte';
	import Parasitology from '$lib/components/forms/record/Parasitology.svelte';
	import Urinalysis from '$lib/components/forms/record/Urinalysis.svelte';
	import Button from '$lib/components/reusable/Button.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { loadRefList, getRefData, cacheRefData } from '$lib/client/refdata.js';
	import { allPending } from '$lib/client/outbox.js';
	import { saveOrQueue } from '$lib/client/saveOrQueue.js';

	export let data;
	let { recordId } = data;
	let record = null;
	let medTechs = [];
	let pathologists = [];
	let category = '';
	let message = null;
	let statusMessages = {
		sending: 'Sending...',
		sent: 'Record updated!',
		incomplete: 'Please complete all required fields.',
		error: 'An error occurred. Please try again later.'
	};
	let pathologist = '';
	let medicalTechnologist = '';
	let selectedOption = '';
	// Reactively spread the loaded record into the individual form fields.
	$: ({
        patientId,
		stat,
		fastingBloodSugar,
		randomBloodSugar,
		postPrandial,
		hba1c,
		urea,
		creatinine,
		uricAcid,
		cholesterol,
		triglycerides,
		hdlCholesterol,
		ldlCholesterol,
		sgotAst,
		sgptAlt,
		sodium,
		potassium,
		calcium,
		exam,
		hemoglobin,
		erythrocyteVolume,
		erythrocyteNumber,
		leukocyteNumber,
		neutrophilNumber,
		segmenters,
		stab,
		eosinophil,
		basophil,
		lympocyte,
		monocyte,
		erythrocyteSedimentation,
		thrombocyteNumber,
		bleedingTime,
		clottingTime,
		bloodType,
		rh,
		color,
		consistency,
		ascarisLumb,
		hookworm,
		trichuris,
		strongyloides,
		entamoebaColiCyst,
		entamoebaColiTroph,
		entamoebaHistCyst,
		entamoebaHistTroph,
		pusCell,
		rbc,
		yeastCell,
		fatGlobules,
		bacteria,
		transparency,
		reaction,
		specificGravity,
		protein,
		sugar,
		fineGran,
		coarseGran,
		pusCellCast,
		hyaline,
		calciumOxolate,
		amorphous,
		tripPhosphates,
		squamous,
		mucous,
		roundEpithelial,
		vaginalis,
		hominis,
		specimen,
		result,
		others,
		remarks
	} = record ?? {});
	let total = '1.0';
	let options = [];

	// Load the record (fetch + cache online; offline read cache or the queued copy),
	// then the reference lists — all offline-capable.
	async function loadRecord() {
		const cacheKey = `record:${recordId}`;
		let r = null;
		if (navigator.onLine) {
			try {
				const res = await fetch(`/api/admin/record/${recordId}`);
				const json = await res.json();
				if (json.response) {
					r = json.response;
					cacheRefData(cacheKey, r);
				}
			} catch (e) {
				/* fall through */
			}
		}
		if (!r) r = await getRefData(cacheKey);
		if (!r) {
			const pend = (await allPending()).find((x) => x.entity === 'record' && x.body?._id === recordId);
			if (pend) r = pend.body;
		}
		if (r) {
			record = r; // drives the reactive field spread above
			pathologist = r.pathologist?._id ?? r.pathologist ?? '';
			medicalTechnologist = r.medicalTechnologist?._id ?? r.medicalTechnologist ?? '';
			category = r.category || '';
		}
	}

	onMount(async () => {
		await loadRecord();
		const [cats, mts, paths] = await Promise.all([
			loadRefList('categories', '/api/admin/record/categories'),
			loadRefList('medTechs', '/api/admin/user/med-tech'),
			loadRefList('pathologists', '/api/admin/user/pathologist')
		]);
		options = cats;
		medTechs = mts;
		pathologists = paths;
		selectedOption = record?.category || (options.length > 0 ? options[0].name : '');
		category = selectedOption;
	});

	const handleOnChange = (e) => {
		selectedOption = e.target.value;
		category = selectedOption;
	};

	async function handleSubmit(e) {
		const body = Object.fromEntries(new FormData(e.currentTarget));
		body.baseUpdated = record?.updated ?? null; // for conflict detection at sync
		message = statusMessages.sending;
		try {
			const res = await saveOrQueue({
				endpoint: '/api/admin/record/update',
				entity: 'record',
				isCreate: false,
				body
			});
			if (res.ok) {
				message = res.synced ? statusMessages.sent : 'Saved offline — will sync automatically.';
				setTimeout(() => {
					message = null;
					goto(`/patients/${patientId}`);
				}, res.synced ? 1500 : 2500);
			} else {
				message = res.result?.message || statusMessages.error;
			}
		} catch (error) {
			message = statusMessages.error;
		}
	}
</script>

<div class="animate-rise-in mx-auto max-w-4xl space-y-5">
	<div>
		<h2 class="font-display text-2xl font-bold text-ink">Update laboratory result</h2>
		<p class="mt-1 text-sm text-muted">Edit this result, then save your changes.</p>
	</div>
	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		<form class="space-y-5 px-6 py-6" on:submit|preventDefault={handleSubmit}>
			<div class="hidden md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="field-label"
						for="inline-record-id"
					>
						Record ID
					</label>
				</div>
				<div class="md:w-5/12">
					<input
						class="field"
						id="inline-record-id"
						placeholder="Record ID"
						type="text"
						name="recordId"
						bind:value={recordId}
					/>
				</div>
			</div>
			<div class="hidden md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="field-label"
						for="inline-patient-id"
					>
						Patient ID
					</label>
				</div>
				<div class="md:w-5/12">
					<input
						class="field"
						id="inline-patient-id"
						placeholder="Patient ID"
						type="text"
						name="patientId"
						bind:value={patientId}
					/>
				</div>
			</div>
			<div class="md:flex md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="field-label"
						for="category"
					>
						Category
					</label>
				</div>
				<div class="md:w-5/12">
					<!-- Category is fixed on update — the result fields differ per category.
					     Disabled control isn't submitted, so a hidden input carries the value. -->
					<input type="hidden" name="category" value={selectedOption} />
					<select
						id="dropdown"
						class="field cursor-not-allowed bg-paper opacity-70"
						bind:value={selectedOption}
						disabled
						aria-label="Category (fixed)"
						title="Category can't be changed when editing a record"
					>
						{#each options as option}
							<option value={option.name}>{option.name}</option>
						{/each}
					</select>
				</div>
			</div>
			{#if selectedOption == 'Chemistry'}
				<Chemistry
					{stat}
					{fastingBloodSugar}
					{randomBloodSugar}
					{postPrandial}
					{hba1c}
					{urea}
					{creatinine}
					{uricAcid}
					{cholesterol}
					{triglycerides}
					{hdlCholesterol}
					{ldlCholesterol}
					{sgotAst}
					{sgptAlt}
					{sodium}
					{potassium}
					{calcium}
				/>
			{:else if selectedOption == 'Hematology'}
				<Hematology
					{stat}
					{exam}
					{hemoglobin}
					{erythrocyteVolume}
					{erythrocyteNumber}
					{leukocyteNumber}
					{neutrophilNumber}
					{segmenters}
					{stab}
					{eosinophil}
					{basophil}
					{lympocyte}
					{monocyte}
					{total}
					{erythrocyteSedimentation}
					{thrombocyteNumber}
					{bleedingTime}
					{clottingTime}
					{bloodType}
					{rh}
					{others}
				/>
			{:else if selectedOption == 'Parasitology'}
				<Parasitology
					{color}
					{consistency}
					{ascarisLumb}
					{hookworm}
					{trichuris}
					{strongyloides}
					{entamoebaColiCyst}
					{entamoebaColiTroph}
					{entamoebaHistCyst}
					{entamoebaHistTroph}
					{pusCell}
					{rbc}
					{yeastCell}
					{fatGlobules}
					{bacteria}
					{others}
					{remarks}
				/>
			{:else if selectedOption == 'Urinalysis'}
				<Urinalysis
					{exam}
					{color}
					{transparency}
					{reaction}
					{specificGravity}
					{protein}
					{sugar}
					{fineGran}
					{coarseGran}
					{pusCellCast}
					{hyaline}
					{rbc}
					{pusCell}
					{uricAcid}
					{calciumOxolate}
					{amorphous}
					{tripPhosphates}
					{squamous}
					{mucous}
					{roundEpithelial}
					{yeastCell}
					{vaginalis}
					{hominis}
				/>
			{:else if selectedOption == 'Miscellaneous'}
				<Miscellaneous {exam} {specimen} {result} {others} {remarks} />
			{/if}
			<hr class="border-line" />
			<div class="md:flex md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="field-label"
						for="inline-firstName"
					>
						Pathologist
					</label>
				</div>
				<div class="md:w-5/12">
					<select
						id="dropdown"
						name="pathologist"
						class="field"
						placeholder="Select an option"
						bind:value={pathologist}
					>
						{#each pathologists as option}
							<option value={option?._id}>{option?.profile?.displayName}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="md:flex md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="field-label"
						for="inline-firstName"
					>
						Medical Technologist
					</label>
				</div>
				<div class="md:w-5/12">
					<select
						id="dropdown"
						name="medicalTechnologist"
						class="field"
						placeholder="Select an option"
						bind:value={medicalTechnologist}
					>
						{#each medTechs as option}
							<option value={option?._id}  >{option?.profile?.displayName}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="flex items-center justify-end gap-3 border-t border-line pt-5">
				{#if message}
					<span transition:fade class="text-sm font-medium text-muted">{@html message}</span>
				{/if}
				<Button type="button" color="primary" text="Save changes" padding="py-2.5 px-5" />
			</div>
		</form>
	</div>
</div>
