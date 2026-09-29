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

<Dashboard {summary} />