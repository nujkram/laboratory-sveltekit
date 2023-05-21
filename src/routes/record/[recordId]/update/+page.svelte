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
	let category = '';
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
    
    onMount(() => {
        if(pathologist) {
            pathologist = pathologist._id;
        }
        
        if(medicalTechnologist) {
            medicalTechnologist = medicalTechnologist._id;
        }
    });
    
	const options = ['Chemistry', 'Hematology', 'Parasitology', 'Urinalysis', 'Miscellaneous'];

	let selectedOption = 'Chemistry';

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
					// goto(`/patients/${patientId}/records`);
				}, 3000);
			} else {
				message = statusMessages.error;
			}
		} catch (error) {
			message = statusMessages.error;
		}
	}
</script>

<div class="border-2 border-gray-100 rounded-lg h-auto dark:border-gray-700 mt-12">
	<div class="flex flex-col justify-center border-b h-fit rounded-t bg-blue-600 dark:bg-gray-800">
		<div class="flex flex-col px-5 justify-center py-4">
			<span class="text-xl font-semibold" style="color:white">Laboratory Assessment</span>
		</div>
	</div>
	<div class="flex items-center mt-4 h-fit mb-1 rounded bg-gray-50 dark:bg-gray-800">
		<form class="w-full mb-4 mx-4" on:submit|preventDefault={handleSubmit}>
			<div class="hidden md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
						for="inline-record-id"
					>
						Record ID
					</label>
				</div>
				<div class="md:w-5/12">
					<input
						class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
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
						class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
						for="inline-patient-id"
					>
						Patient ID
					</label>
				</div>
				<div class="md:w-5/12">
					<input
						class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
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
						class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
						for="category"
					>
						Category
					</label>
				</div>
				<div class="md:w-5/12">
					<select
						id="dropdown"
						name="category"
						class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
						placeholder="Select an option"
						on:change={handleOnChange}
					>
						{#each options as option}
							<option value={option}>{option}</option>
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
			<hr class="mb-4" />
			<div class="md:flex md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
						for="inline-firstName"
					>
						Pathologist
					</label>
				</div>
				<div class="md:w-5/12">
					<select
						id="dropdown"
						name="pathologist"
						class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
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
						class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
						for="inline-firstName"
					>
						Medical Technologist
					</label>
				</div>
				<div class="md:w-5/12">
					<select
						id="dropdown"
						name="medicalTechnologist"
						class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
						placeholder="Select an option"
						bind:value={medicalTechnologist}
					>
						{#each medTechs as option}
							<option value={option?._id}  >{option?.profile?.displayName}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="md:flex md:items-center">
				<div class="md:w-3/12" />
				<div class="md:w-9/12 text-right">
					<Button type="button" bgColor="bg-green-500" textSize="text-xs" text="Submit" />
				</div>
			</div>
		</form>
	</div>
	{#if message}
		<div
			transition:fade
			class="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 mt-4 rounded-b"
			role="alert"
		>
			<svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
				><path
					d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"
				/></svg
			>
			<p>{@html message}</p>
		</div>
	{/if}
</div>
