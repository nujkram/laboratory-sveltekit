<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { SHA256 } from 'crypto-js';
	import Logo from '$lib/components/Logo.svelte';

	export let data;
	const { user, settings } = data;

	let email = '';
	let password = '';
	let error = '';
	let loggingIn = false;
	let hasAccess = false;
	$: {
		if (user) {
			hasAccess = true;
		} else {
			setTimeout(() => {
				hasAccess = false;
			}, 500);
			goto('/auth/login');
		}
	}

	const handleLogin = async () => {
		const securePassword = await SHA256(password).toString();
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ email, password: securePassword })
		});
		const data = await response.json();

		if (data.error) {
			error = data.errorMessage || 'An error occured';
			loggingIn = false;
		} else {
			page.subscribe((value) => {
				value.data.user = {
					_id: data.user._id,
					profile: {
						email: data.user.profile.email,
						firstName: data.user.profile.firstName,
						lastName: data.user.profile.lastName,
						phone: data.user.profile.phone,
						photo: data.user.profile.photo,
						country: data.user.profile.country,
						province: data.user.profile.province,
						displayName: data.user.profile.displayName
					},
					email: data.user.profile.email
				};
			});
			goto('/');
		}
	};
</script>

<svelte:head>
	<title>Sign in · Laboratory Information System</title>
</svelte:head>

<div class="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
	<!-- Brand panel -->
	<section
		class="relative hidden flex-col justify-between overflow-hidden bg-pine-fade px-10 py-12 text-white lg:flex xl:px-16"
	>
		<div class="flex items-center gap-3 text-leaf-active">
			<Logo size={40} year={false} />
			<span class="text-xs font-semibold uppercase tracking-[0.22em]">Est. 1997</span>
		</div>

		<div class="max-w-md">
			<p class="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-leaf-active">
				Laboratory Information System
			</p>
			<h2 class="font-display text-4xl font-bold leading-[1.1] xl:text-5xl">
				{settings?.name || 'Diagnostic laboratory serving the community'}
			</h2>
			<p class="mt-5 text-base leading-relaxed text-white/70">
				Enter and read patient results with the same care you bring to the bench — clearly, and
				without error.
			</p>
			<div class="mt-8 space-y-1.5 text-sm text-white/60">
				{#if settings?.location}<p>{settings.location}</p>{/if}
				{#if settings?.mobile}<p class="font-mono">{settings.mobile}</p>{/if}
			</div>
		</div>

		<!-- Signature: a row of pine peaks echoing the logo -->
		<div class="peak-edge h-[11px] w-44" aria-hidden="true" />
	</section>

	<!-- Sign-in panel -->
	<section class="flex flex-col justify-center bg-paper px-6 py-12 sm:px-12">
		<div class="mx-auto w-full max-w-sm animate-rise-in">
			<!-- Compact brand for mobile, where the pine panel is hidden -->
			<div class="mb-8 flex items-center gap-3 text-pine-700 lg:hidden">
				<Logo size={40} year={false} />
				<span class="font-display text-lg font-bold text-ink">Laboratory<br />Information System</span>
			</div>

			<h1 class="font-display text-2xl font-bold text-ink">Sign in</h1>
			<p class="mt-1.5 text-sm text-muted">Welcome back. Enter your credentials to continue.</p>

			<form
				class="mt-8 space-y-5"
				method="POST"
				autocomplete="off"
				on:submit={(e) => {
					e.preventDefault();
					if (!loggingIn) {
						loggingIn = true;
						handleLogin();
					}
				}}
			>
				<div>
					<label for="email" class="mb-1.5 block text-sm font-medium text-ink">Email</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						name="email"
						autocomplete="username"
						placeholder="you@laboratory.ph"
						class="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-leaf focus:ring-2 focus:ring-leaf/25"
					/>
				</div>
				<div>
					<label for="password" class="mb-1.5 block text-sm font-medium text-ink">Password</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						name="password"
						autocomplete="current-password"
						class="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-leaf focus:ring-2 focus:ring-leaf/25"
					/>
				</div>

				{#if error}
					<p class="flex items-start gap-2 rounded-lg bg-danger/8 px-3 py-2 text-sm text-danger">
						<svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 6a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z"
								clip-rule="evenodd"
							/>
						</svg>
						{error}
					</p>
				{/if}

				<button
					type="submit"
					disabled={loggingIn}
					class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-70"
				>
					{#if loggingIn}
						<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
							<path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
						</svg>
						Signing in…
					{:else}
						Sign in
					{/if}
				</button>
			</form>

			<p class="mt-6 text-xs text-muted">
				Forgot your password? Contact your administrator for a reset.
			</p>

			<p class="mt-10 border-t border-line pt-6 text-xs text-muted">
				© {new Date().getFullYear()} {settings?.name || 'Laboratory Information System'} · Est. 1997
			</p>
		</div>
	</section>
</div>
