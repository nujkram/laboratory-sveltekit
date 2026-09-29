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
	import { calculateAge } from '$lib/utils/ageHelper';
	import { allPending } from '$lib/client/outbox.js';
	import { saveOrQueue } from '$lib/client/saveOrQueue.js';

	export let data;
	let { recordId } = data;
	let record = null;

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
	$: if (patientId && !patient && !patientMissing) loadPatient(patientId);
	$: pickedSlip = record?.transaction ?? null;
	let loading = true;
	let notFound = false;
	// Blocks a second submit while the first is in flight — a double click
	// otherwise sends two updates and the second fails with a conflict.
	let submitting = false;
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
		total = '1.0',
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
		psa
	} = record ?? {});
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
		notFound = !record;
		loading = false;
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
		if (submitting) return;
		submitting = true;
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
				submitting = false;
			}
		} catch (error) {
			message = statusMessages.error;
			submitting = false;
		}
	}
</script>

<svelte:head><title>Update result · Laboratory Information System</title></svelte:head>

<div class="animate-rise-in mx-auto max-w-4xl space-y-5">
	<div>
		<h2 class="font-display text-2xl font-bold text-ink">Update laboratory result</h2>
		<p class="mt-1 text-sm text-muted">
			Edit this result, then save your changes.
			{#if record?.caseNumber}<span class="font-mono text-ink">Case {record.caseNumber}</span>{/if}
		</p>
	</div>
	{#if !loading && !notFound}
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
	{/if}
	{#if loading}
		<div class="flex items-center justify-center gap-3 rounded-xl border border-line bg-surface px-6 py-14 text-muted shadow-card">
			<svg class="h-5 w-5 animate-spin text-leaf" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
			<path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
										</svg>
			<span class="text-sm font-medium">Loading the record…</span>
		</div>
	{:else if notFound}
		<div class="rounded-xl border border-line bg-surface px-6 py-14 text-center shadow-card">
			<p class="font-display text-base font-semibold text-ink">Record not found</p>
			<p class="mt-1 text-sm text-muted">It may have been deleted, or the link is out of date.</p>
			<div class="mt-4"><Button type="link" href="/record" color="primary" text="Browse records" /></div>
		</div>
	{/if}
	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card" class:hidden={loading || notFound}>
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
						for="inline-category"
					>
						Category
					</label>
				</div>
				<div class="md:w-5/12">
					<!-- Category is fixed on update — the result fields differ per category.
					     Disabled control isn't submitted, so a hidden input carries the value. -->
					<input type="hidden" name="category" value={selectedOption} />
					<select id="inline-category"
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
					{mcv}
					{mch}
					{mchc}
					{rdwCv}
					{mpv}
					{others}
					{remarks}
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
						value={requestedBy ?? ''}
					/>
				</div>
			</div>
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
							<option value={option?._id}  >{option?.profile?.displayName}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="flex items-center justify-end gap-3 border-t border-line pt-5">
				{#if message}
					<span transition:fade class="text-sm font-medium text-muted">{message}</span>
				{/if}
				<Button htmlType="submit" type="button" color="primary" text={submitting ? 'Saving…' : 'Save changes'} disabled={submitting || notFound} padding="py-2.5 px-5" />
			</div>
		</form>
	</div>
</div>
