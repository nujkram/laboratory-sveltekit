<script>
	// @ts-nocheck
	import Chemistry from "$lib/components/forms/record/Chemistry.svelte";
	import Hematology from "$lib/components/forms/record/Hematology.svelte";
	import Miscellaneous from "$lib/components/forms/record/Miscellaneous.svelte";
	import Parasitology from "$lib/components/forms/record/Parasitology.svelte";
	import Urinalysis from "$lib/components/forms/record/Urinalysis.svelte";
	export let data;
	let { patientId } = data;
	let category = '';
	let message = null;
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
		pathologist,
		medicalTechnologist,
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
		remarks;
	let total = '1.0';

	const options = ['Chemistry', 'Hematology', 'Parasitology', 'Urinalysis', 'Miscellaneous'];

	let selectedOption = 'Chemistry';

	const handleOnChange = (e) => {
		selectedOption = e.target.value;
		category = selectedOption;
		console.log(category);
	};
</script>

<div class="border-2 border-gray-100 rounded-lg h-auto dark:border-gray-700 mt-12">
	<div class="flex flex-col justify-center border-b h-fit rounded-t bg-blue-600 dark:bg-gray-800">
		<div class="flex flex-col px-5 justify-center py-4">
			<span class="text-xl font-semibold" style="color:white">Laboratory Assessment</span>
		</div>
	</div>
	<div class="flex items-center mt-4 h-fit mb-1 rounded bg-gray-50 dark:bg-gray-800">
		<form class="w-full mb-4 mx-4" on:submit|preventDefault={async () => {}}>
			<div class="md:flex md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
						for="inline-firstName"
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
						{#each options as option}
							<option value={option}>{option}</option>
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
						{#each options as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>
			</div>
		</form>
	</div>
</div>
