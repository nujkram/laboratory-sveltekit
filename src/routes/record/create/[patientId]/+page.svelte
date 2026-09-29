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
	import { loadRefList, getRefData, cacheRefData } from '$lib/client/refdata.js';
	import { saveOrQueue } from '$lib/client/saveOrQueue.js';
	import { formatPeso } from '$lib/utils/currency';
	import { calculateAge } from '$lib/utils/ageHelper';
	import ChemistryModal from '$lib/components/modals/ChemistryModal.svelte';
	import HematologyModal from '$lib/components/modals/HematologyModal.svelte';
	import UrinalysisModal from '$lib/components/modals/UrinalysisModal.svelte';
	import ParasitologyModal from '$lib/components/modals/ParasitologyModal.svelte';
	import MiscModal from '$lib/components/modals/MiscModal.svelte';

	export let data;
	let { patientId } = data;

	// The patient this chart belongs to — shown at the top so a result cannot
	// quietly be filed against the wrong person. Cached copy when offline.
	let patient = null;
	let patientMissing = false;
	async function loadPatient(id) {
		if (!id) return;
		if (navigator.onLine) {
			try {
				const res = await fetch(`/api/admin/patient/${id}`);
				const json = await res.json();
				if (json.response) {
					patient = json.response;
					cacheRefData(`patient:${id}`, patient);
					return;
				}
			} catch (e) {
				/* fall through to the cache */
			}
		}
		patient = (await getRefData(`patient:${id}`)) ?? null;
		if (!patient) {
			const list = (await getRefData('patients')) ?? [];
			patient = list.find((p) => p._id === id) || null;
		}
		patientMissing = !patient;
	}
	let medTechs = [];
	let pathologists = [];
	let caseNumber = '';
	let provisionalCase = false;
	let category = '';
	let message = null;
	// Blocks a second submit while the first request is in flight — otherwise a
	// double-click queues two records, each with its own client _id (no dedupe).
	let submitting = false;
	let savedId = null;
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
		mcv,
		mch,
		mchc,
		rdwCv,
		mpv,
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
		requestedBy,
		remarks,
		analyzer,
		ns1,
		igm,
		igg,
		tsh,
		ft3,
		ft4,
		t3,
		t4,
		psa;
	let total = '1.0';

	let options = [];
	let selectedOption = '';

	// Charge slips already raised for this patient, so the result can be tied to
	// what was actually paid for. Online-only: offline the picker simply is not
	// offered and the record saves unlinked, which is a valid state.
	let transactions = [];
	let transactionId = '';

	async function loadTransactions() {
		if (typeof navigator !== 'undefined' && !navigator.onLine) return;
		try {
			const res = await fetch('/api/admin/lab-transaction', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ patientId, pageSize: 25, sortBy: 'created', sortOrder: 'desc' })
			});
			const result = await res.json();
			if (result?.status !== 'Success') return;
			transactions = (result.response ?? []).filter((t) => t.status !== 'Cancelled');
			// Opened from a specific slip: take that one. Otherwise the slip in the
			// patient's hand is almost always the unpaid one.
			const fromLink = transactions.find((t) => t._id === data.transactionId);
			transactionId =
				(fromLink ?? transactions.find((t) => t.paymentStatus === 'Unpaid') ?? transactions[0])?._id ?? '';
		} catch {
			// no picker; the record still saves without a link
		}
	}

	function describeSlip(t) {
		return `${t.referenceNumber} · ${formatPeso(t.netCentavos)} · ${t.paymentStatus}`;
	}

	$: pickedSlip = transactions.find((t) => t._id === transactionId) ?? null;
	// The slip already names the requesting physician; whichever slip is picked
	// fills the field while it is still empty, so the name is not typed twice.
	$: if (pickedSlip?.requestedBy && !requestedBy) requestedBy = pickedSlip.requestedBy;

	// After a save that reached the server, the result can be printed right
	// here instead of hunting for it on the chart.
	let savedRecord = null;
	let isPrintOpen = false;
	async function openSaved(id) {
		try {
			const res = await fetch(`/api/admin/record/${id}`);
			const json = await res.json();
			if (json.response) {
				savedRecord = { ...json.response, patient };
				isPrintOpen = true;
			}
		} catch {
			/* the chart still has it */
		}
	}

	onMount(async () => {
		loadPatient(patientId);
		loadTransactions();
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
		if (submitting) return;
		const form = e.currentTarget;
		const body = Object.fromEntries(new FormData(form));
		if (provisionalCase) delete body.caseNumber; // let the server assign it
		message = statusMessages.sending;
		submitting = true;
		try {
			const res = await saveOrQueue({
				endpoint: '/api/admin/record/insert',
				entity: 'record',
				body
			});
			if (res.ok) {
				if (res.synced) {
					// Stay: offer Print now / Back to chart rather than bouncing away.
					message = statusMessages.sent;
					savedId = res.doc._id;
				} else {
					message = 'Saved offline — will sync automatically.';
					// Patient chart needs the server; offline, go to the Pending list instead.
					setTimeout(() => {
						message = null;
						goto('/pending');
					}, 2500);
				}
			} else {
				message = res.result?.message || statusMessages.error;
					submitting = false;
			}
		} catch (error) {
			message = statusMessages.error;
			submitting = false;
		}
	}
</script>

<svelte:head><title>New result · Laboratory Information System</title></svelte:head>

<div class="animate-rise-in mx-auto max-w-4xl space-y-5">
	<div>
		<h2 class="font-display text-2xl font-bold text-ink">New laboratory result</h2>
		<p class="mt-1 text-sm text-muted">Record a result against this patient's chart.</p>
	</div>
	<!-- Whose chart this goes on: the one check that prevents a result being
	     filed against the wrong person. -->
	<div class="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-pine-fade px-5 py-4 text-white shadow-card">
		<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-leaf-active ring-2 ring-white/15">
			<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path d="M10 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM3.5 16.5a6.5 6.5 0 0113 0 .5.5 0 01-.5.5H4a.5.5 0 01-.5-.5z" />
			</svg>
		</span>
		<div class="min-w-0 flex-1">
			<p class="font-display text-lg font-bold leading-tight">
				{patient?.completeName ?? (patientMissing ? 'Patient not found' : 'Loading patient…')}
			</p>
			<p class="mt-0.5 text-sm text-white/70">
				{#if patient}
					{[patient.gender, patient.birthDate ? `${calculateAge(patient.birthDate)} yrs` : '', patient.address].filter(Boolean).join(' · ') || '—'}
				{:else if patientMissing}
					Check the link you followed — this chart does not exist.
				{/if}
			</p>
		</div>
		{#if pickedSlip}
			<span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-mono text-xs font-medium text-leaf-active" title="Charge slip this result is linked to">
				{pickedSlip.referenceNumber} · {pickedSlip.paymentStatus}
			</span>
		{/if}
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
						for="inline-category"
					>
						Category
					</label>
				</div>
				<div class="md:w-5/12">
					<select id="inline-category"
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
				<Hematology {stat} {exam} {hemoglobin} {erythrocyteVolume} {erythrocyteNumber} {leukocyteNumber} {neutrophilNumber} {segmenters} {stab} {eosinophil} {basophil} {lympocyte} {monocyte} {total} {erythrocyteSedimentation} {thrombocyteNumber} {bleedingTime} {clottingTime} {bloodType} {rh} {mcv} {mch} {mchc} {rdwCv} {mpv} {others} {remarks} />
			{:else if selectedOption == 'Parasitology'}
				<Parasitology {color} {consistency} {ascarisLumb} {hookworm} {trichuris} {strongyloides} {entamoebaColiCyst} {entamoebaColiTroph} {entamoebaHistCyst} {entamoebaHistTroph} {pusCell} {rbc} {yeastCell} {fatGlobules} {bacteria} {others} {remarks} />
			{:else if selectedOption == 'Urinalysis'}
				<Urinalysis {exam} {color} {transparency} {reaction} {specificGravity} {protein} {sugar} {fineGran} {coarseGran} {pusCellCast} {hyaline} {rbc} {pusCell} {uricAcid} {calciumOxolate} {amorphous} {tripPhosphates} {squamous} {mucous} {roundEpithelial} {yeastCell} {vaginalis} {hominis} />
			{:else if selectedOption == 'Miscellaneous'}
				<Miscellaneous {exam} {specimen} {result} {others} {remarks} {analyzer} {ns1} {igm} {igg} {tsh} {ft3} {ft4} {t3} {t4} {psa} />
			{/if}
			<hr class="border-line" />
			<div class="md:flex md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="field-label"
						for="inline-requestedBy"
					>
						Requested by
					</label>
				</div>
				<div class="md:w-5/12">
					<input
						class="field"
						id="inline-requestedBy"
						placeholder="e.g. DR. SANTOS"
						type="text"
						name="requestedBy"
						bind:value={requestedBy}
					/>
				</div>
			</div>
			{#if transactions.length}
				<div class="md:flex md:items-center mb-6">
					<div class="md:w-3/12">
						<label class="field-label" for="inline-transaction">Charge slip</label>
					</div>
					<div class="md:w-5/12">
						<select id="inline-transaction" name="transactionId" class="field" bind:value={transactionId}>
							<option value="">Not linked to a charge slip</option>
							{#each transactions as t (t._id)}
								<option value={t._id}>{describeSlip(t)}</option>
							{/each}
						</select>
						<span class="field-hint">
							Ties this result to what the patient was charged, and warns before it is
							released while the slip is unpaid.
						</span>
					</div>
				</div>
			{/if}
			<div class="md:flex md:items-center mb-6">
				<div class="md:w-3/12">
					<label
						class="field-label"
						for="inline-pathologist"
					>
						Pathologist
					</label>
				</div>
				<div class="md:w-5/12">
					<select id="inline-pathologist" name="pathologist" class="field" required bind:value={pathologist}>
						<option value="" disabled>Select…</option>
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
						for="inline-medicalTechnologist"
					>
						Medical Technologist
					</label>
				</div>
				<div class="md:w-5/12">
					<select id="inline-medicalTechnologist" name="medicalTechnologist" class="field" required bind:value={medicalTechnologist}>
						<option value="" disabled>Select…</option>
						{#each medTechs as option}
							<option value={option?._id}>{option?.profile?.displayName}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
				{#if message}
					<span transition:fade class="text-sm font-medium {savedId ? 'text-pine-700' : 'text-muted'}">{message}</span>
				{/if}
				{#if savedId}
					<Button color="primary" text="Print now" padding="py-2.5 px-5" on:click={() => openSaved(savedId)} />
					<Button type="link" href="/patients/{patientId}" color="secondary" text="Back to chart" padding="py-2.5 px-5" />
				{:else}
					<Button htmlType="submit" type="button" color="primary" text={submitting ? 'Saving…' : 'Save result'} disabled={submitting} padding="py-2.5 px-5" />
				{/if}
			</div>
		</form>
	</div>
</div>

{#if isPrintOpen && savedRecord}
	{#if savedRecord.category === 'Chemistry'}
		<ChemistryModal bind:isViewModalOpen={isPrintOpen} data={savedRecord} />
	{:else if savedRecord.category === 'Hematology'}
		<HematologyModal bind:isViewModalOpen={isPrintOpen} data={savedRecord} />
	{:else if savedRecord.category === 'Urinalysis'}
		<UrinalysisModal bind:isViewModalOpen={isPrintOpen} data={savedRecord} />
	{:else if savedRecord.category === 'Parasitology'}
		<ParasitologyModal bind:isViewModalOpen={isPrintOpen} data={savedRecord} />
	{:else if savedRecord.category === 'Miscellaneous'}
		<MiscModal bind:isViewModalOpen={isPrintOpen} data={savedRecord} />
	{/if}
{/if}
