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
	export let data;
	let { recordId, record, medTechs, pathologists } = data;
	let category = record?.category || '';
	let message = null;
	let statusMessages = {
		sending: 'Sending...',
		sent: 'Record updated!',
		incomplete: 'Please complete all required fields.',
		error: 'An error occurred. Please try again later.'
	};
	let {
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
		pathologist,
		medicalTechnologist,
		remarks
	} = record;
	let total = '1.0';
	let options = [];

    async function loadCategories() {
		try {
			let response = await fetch('/api/admin/record/categories', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			let result = await response.json();
			options = result.response;
			// Default to THIS record's category so the correct sub-form (with its
			// existing values) is shown — not just the first category in the list.
			selectedOption = record?.category || (options.length > 0 ? options[0].name : '');
			category = selectedOption;
		} catch (error) {
			console.error('error', error);
		}
	}

    onMount(() => {
		loadCategories();
        if(pathologist) {
            pathologist = pathologist._id;
        }
        
        if(medicalTechnologist) {
            medicalTechnologist = medicalTechnologist._id;
        }
    });
    
	let selectedOption = record?.category || '';

	const handleOnChange = (e) => {
		selectedOption = e.target.value;
		category = selectedOption;
	};

	async function handleSubmit(e) {
		console.log('clicked');
		const form = e.currentTarget;
		const formData = new FormData(form);
		let data = Object.fromEntries(formData);
		message = statusMessages.sending;
		try {
			let result = await fetch('/api/admin/record/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			const response = await result.json();
			if (response.status === 'Success') {
				message = statusMessages.sent;
				setTimeout(() => {
					message = null;
					goto(`/patients/${patientId}`);
				}, 3000);
			} else {
				message = statusMessages.error;
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
