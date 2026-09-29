<script>
	import Dashboard from "$lib/components/Dashboard.svelte";

	export let data;
	$: summary = data.summary ?? {
		counts: { users: 0, patients: 0, records: 0 },
		kpis: { recordsThisMonth: 0, recordsToday: 0, patientsThisMonth: 0, activePatients: 0 },
		categories: [],
		roles: [],
		monthly: [],
		topMedTechs: []
	};
</script>

<svelte:head><title>Dashboard · Laboratory Information System</title></svelte:head>

{#if data?.loadError}
	<div class="mb-4 flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
		<span class="flex-1">{data.loadError} The figures below are not current.</span>
		<a href="/" data-sveltekit-reload class="text-xs font-semibold underline">Reload</a>
	</div>
{/if}
<Dashboard {summary} />