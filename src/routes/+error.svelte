<script>
	import { page } from '$app/stores';
	console.error($page);
</script>

<div class="max-w-screen-lg mx-auto bg-white min-h-[80vh] grid place-content-center">
	<h1 class="text-2xl">{$page?.error?.message}</h1>
</div>
