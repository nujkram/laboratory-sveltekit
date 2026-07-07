<script>
    // @ts-nocheck
	import { fade } from 'svelte/transition';
	import Button from "$lib/components/reusable/Button.svelte";
	import { DateInput} from 'date-picker-svelte';
	import { goto } from '$app/navigation';
	import { saveOrQueue } from '$lib/client/saveOrQueue.js';

    let firstName, middleName, lastName, address, message;
	let gender = '';
	// Guards against double-submit — a second click before the first request
	// resolves would otherwise queue a second patient with a new client _id.
	let submitting = false;
	// Not defaulted to today — an unset DOB would otherwise be saved as the
	// creation date and compute a wrong age. The field is required below.
	let birthDate = null;
	// Allow any realistic birth date; never a future date.
	const minDob = new Date(1900, 0, 1);
	const maxDob = new Date();
</script>
<div class="animate-rise-in mx-auto max-w-2xl space-y-5">
	<div>
		<h2 class="font-display text-2xl font-bold text-ink">New patient</h2>
		<p class="mt-1 text-sm text-muted">Add a patient to the registry.</p>
	</div>
	<div class="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
    <form
		class="space-y-5 px-6 py-6"
		on:submit|preventDefault={async () => {
				if (submitting) return;
			if (!birthDate) {
				message = 'Please enter the patient’s birth date.';
				setTimeout(() => (message = null), 3000);
				return;
			}
			if (!gender) {
				message = 'Please select the patient’s gender.';
				setTimeout(() => (message = null), 3000);
				return;
			}
			submitting = true;
			try {
				const res = await saveOrQueue({
					endpoint: '/api/admin/patient/insert',
					entity: 'patient',
					body: { firstName, middleName, lastName, gender, birthDate, address }
				});
				if (res.ok) {
					message = res.synced
						? (res.result?.message || 'Patient saved.')
						: 'Saved offline — will sync automatically.';
					setTimeout(() => {
						message = null;
						goto('/patients'); // patients list works offline (shows pending)
					}, res.synced ? 1500 : 2500);
				} else {
					message = res.result?.message || 'An error occurred. Please try again.';
						submitting = false;
				}
			} catch (error) {
				console.error('error', error);
					submitting = false;
			}
		}}
	>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="field-label"
					for="inline-firstName"
				>
					First Name
				</label>
			</div>
			<div class="md:w-9/12">
				<input
					class="field"
					id="inline-firstName"
					type="text"
					name="firstName"
					bind:value={firstName}
				/>
			</div>
		</div>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="field-label"
					for="inline-middleName"
				>
					Middle Name
				</label>
			</div>
			<div class="md:w-9/12">
				<input
					class="field"
					id="inline-middleName"
					type="text"
					name="middleName"
					bind:value={middleName}
				/>
			</div>
		</div>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="field-label"
					for="inline-lastName"
				>
					Last Name
				</label>
			</div>
			<div class="md:w-9/12">
				<input
					class="field"
					id="inline-lastName"
					type="text"
					name="lastName"
					bind:value={lastName}
				/>
			</div>
		</div>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="field-label"
					for="inline-gender"
				>
					Gender
				</label>
			</div>
			<div class="md:w-9/12">
				<select name="gender" bind:value={gender} class="field">
					<option value="" disabled>Select…</option>
					<option value="Male">Male</option>
					<option value="Female">Female</option>
				</select>
			</div>
		</div>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="field-label"
					for="inline-birthDate"
				>
					Birth Date
				</label>
			</div>
			<div class="md:w-9/12">
				<DateInput bind:value={birthDate} min={minDob} max={maxDob} format="yyyy-MM-dd" placeholder="Select birth date" />
			</div>
		</div>
		<div class="md:flex md:items-center mb-6">
			<div class="md:w-3/12">
				<label
					class="field-label"
					for="inline-address"
				>
					Address
				</label>
			</div>
			<div class="md:w-9/12">
				<input
					class="field"
					id="inline-address"
					type="text"
					name="address"
					bind:value={address}
				/>
			</div>
		</div>

		<div class="flex items-center justify-end gap-3 border-t border-line pt-5">
			{#if message}
				<span transition:fade class="text-sm font-medium text-muted">{@html message}</span>
			{/if}
			<Button type="button" color="primary" text={submitting ? 'Saving…' : 'Save patient'} disabled={submitting} padding="py-2.5 px-5" />
		</div>
	</form>
	</div>
</div>

<style>
	:root {
		--date-input-width: 100%;
		--date-picker-background: #ffffff;
		--date-picker-foreground: #142218;
		--date-picker-highlight-border: #46a02e;
		--date-picker-selected-color: #ffffff;
		--date-picker-selected-background: #1b5e3f;
	}
	:global(.date-time-field input) {
		border-radius: 0.5rem;
		border: 1px solid #e1e8de;
		padding: 0.625rem 0.875rem;
		font-size: 0.875rem;
		color: #142218;
		width: 100%;
	}
	:global(.date-time-field input:focus) {
		border-color: #46a02e;
		outline: none;
		box-shadow: 0 0 0 2px rgba(70, 160, 46, 0.25);
	}
</style>