<script>
	// @ts-nocheck
	import { fade } from 'svelte/transition';
	import Chemistry from "$lib/components/forms/record/Chemistry.svelte";
	import Hematology from "$lib/components/forms/record/Hematology.svelte";
	import Miscellaneous from "$lib/components/forms/record/Miscellaneous.svelte";
	import Parasitology from "$lib/components/forms/record/Parasitology.svelte";
	import Urinalysis from "$lib/components/forms/record/Urinalysis.svelte";
	import Button from "$lib/components/reusable/Button.svelte";
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { loadRefList } from '$lib/client/refdata.js';
	import { saveOrQueue } from '$lib/client/saveOrQueue.js';

	export let data;
	let { patientId } = data;
	let medTechs = [];
	let pathologists = [];
	let caseNumber = '';
	let provisionalCase = false;
	let category = '';
	let message = null;
	let statusMessages = {
		sending: 'Sending...',
		sent: 'Record Saved!',
		incomplete: 'Please complete all required fields.',
		error: 'An error occurred. Please try again later.',
	};
	let stat,
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
		remarks;
	let total = '1.0';

	let options = [];
	let selectedOption = '';

	onMount(async () => {
		// Reference lists: fresh when online, last-cached when offline.
		const [cats, mts, paths] = await Promise.all([
			loadRefList('categories', '/api/admin/record/categories'),
			loadRefList('medTechs', '/api/admin/user/med-tech'),
			loadRefList('pathologists', '/api/admin/user/pathologist')
		]);
		options = cats;
		medTechs = mts;
		pathologists = paths;
		selectedOption = options.length > 0 ? options[0].name : '';
		category = selectedOption;
		await loadCaseNumber();
	});

	async function loadCaseNumber() {
		if (navigator.onLine) {
			try {
				const res = await fetch('/api/admin/record/next-case-number');
				const json = await res.json();
				caseNumber = json.response.next;
				provisionalCase = false;
				return;
			} catch (e) {
				/* fall through to provisional */
			}
		}
		// Offline: real number is assigned by the server at sync time.
		caseNumber = 'pending';
		provisionalCase = true;
	}

	const handleOnChange = (e) => {
		selectedOption = e.target.value;
		category = selectedOption;
	};

	async function handleSubmit(e) {
		const form = e.currentTarget;
		const body = Object.fromEntries(new FormData(form));
		if (provisionalCase) delete body.caseNumber; // let the server assign it
		message = statusMessages.sending;
		try {
			const res = await saveOrQueue({
				endpoint: '/api/admin/record/insert',
				entity: 'record',
				body
			});
			if (res.ok) {
				message = res.synced ? statusMessages.sent : 'Saved offline — will sync automatically.';
				setTimeout(() => {
					message = null;
					// Patient chart needs the server; offline, go to the Pending list instead.
					goto(res.synced ? `/patients/${patientId}` : '/pending');
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
		<h2 class="font-display text-2xl font-bold text-ink">New laboratory result</h2>
		<p class="mt-1 text-sm text-muted">Record a result against this patient's chart.</p>
	</div>
	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
		<form class="space-y-5 px-6 py-6" on:submit|preventDefault={handleSubmit}>
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
			<div class="hidden md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="field-label"
						for="inline-caseNumber-id"
					>
						Case Number
					</label>
				</div>
				<div class="md:w-5/12">
					<input
						class="field"
						id="inline-caseNumber-id"
						placeholder="Case Number"
						type="text"
						name="caseNumber"
						bind:value={caseNumber}
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
					<select
						id="dropdown"
						name="category"
						class="field"
						placeholder="Select an option"
						on:change={handleOnChange}
					>
						{#each options as option}
							<option value={option.name}>{option.name}</option>
						{/each}
					</select>
				</div>
			</div>
			{#if selectedOption == 'Chemistry'}
				<Chemistry {stat} {fastingBloodSugar} {randomBloodSugar} {postPrandial} {hba1c} {urea} {creatinine} {uricAcid} {cholesterol} {triglycerides} {hdlCholesterol} {ldlCholesterol} {sgotAst} {sgptAlt} {sodium} {potassium} {calcium} />
			{:else if selectedOption == 'Hematology'}
				<Hematology {stat} {exam} {hemoglobin} {erythrocyteVolume} {erythrocyteNumber} {leukocyteNumber} {neutrophilNumber} {segmenters} {stab} {eosinophil} {basophil} {lympocyte} {monocyte} {total} {erythrocyteSedimentation} {thrombocyteNumber} {bleedingTime} {clottingTime} {bloodType} {rh} {others} />
			{:else if selectedOption == 'Parasitology'}
				<Parasitology {color} {consistency} {ascarisLumb} {hookworm} {trichuris} {strongyloides} {entamoebaColiCyst} {entamoebaColiTroph} {entamoebaHistCyst} {entamoebaHistTroph} {pusCell} {rbc} {yeastCell} {fatGlobules} {bacteria} {others} {remarks} />
			{:else if selectedOption == 'Urinalysis'}
				<Urinalysis {exam} {color} {transparency} {reaction} {specificGravity} {protein} {sugar} {fineGran} {coarseGran} {pusCellCast} {hyaline} {rbc} {pusCell} {uricAcid} {calciumOxolate} {amorphous} {tripPhosphates} {squamous} {mucous} {roundEpithelial} {yeastCell} {vaginalis} {hominis} />
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
							<option value={option?._id}>{option?.profile?.displayName}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="flex items-center justify-end gap-3 border-t border-line pt-5">
				{#if message}
					<span transition:fade class="text-sm font-medium text-muted">{@html message}</span>
				{/if}
				<Button type="button" color="primary" text="Save result" padding="py-2.5 px-5" />
			</div>
		</form>
	</div>
</div>
