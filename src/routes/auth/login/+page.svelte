<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { SHA256 } from 'crypto-js';

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

<div class="relative overflow-hidden h-52 text-center translate-y-50 animate-slide-down">
	<div
		class="absolute top-0 right-0 bottom-0 left-0 h-full w-full overflow-hidden bg-fixed"
		style="background-color: rgba(0, 0, 0, 0.6)"
	>
		<div class="flex h-full items-center justify-center">
			<div class="text-white">
				<h2 class="mb-4 text-4xl font-semibold">{settings?.name || 'Laboratory Management System'}</h2>
				<h4>{settings?.location || ''}</h4>
				<p>{settings?.mobile || ''}</p>
			</div>
		</div>
	</div>
</div>

<section class="text-gray-600 body-font">
	<div class="container px-5 py-24 mx-auto flex flex-wrap items-center">
		<div class="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0 translate-x-full animate-fade-in-left">
			<h1 class="title-font font-bold text-5xl text-gray-900">Laboratory Records</h1>
			<p class="leading-relaxed mt-4 text-sm">
				Laboratory Management System (LMS) is a software application that is designed to help manage the day-to-day operations of a laboratory.
			</p>
		</div>

		<div
			class="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 translate-x-full animate-fade-in-right"
		>
			<form
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
				<div class="relative mb-4">
					<label for="email" class="leading-7 text-sm text-gray-600">Email</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						name="email"
						class="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
					/>
				</div>
				<div class="relative mb-4">
					<label for="password" class="leading-7 text-sm text-gray-600">Password</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						name="password"
						class="w-full rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
					/>
				</div>
				<button
					class="text-white bg-blue-500 border-0 py-2 px-8 focus:outline-none hover:bg-blue-600 rounded text-lg"
					>Login</button
				>
				<div class="text-custom-red h-1">{error}</div>
				<p class="text-xs text-gray-500 mt-3">
					Forgot password? Contact administrator for a reset.
				</p>
			</form>
		</div>
	</div>
</section>

<footer
	class="fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600"
>
	<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400"
		>© 2023 <a href="https://flowbite.com/" class="hover:underline">Maveous Galley™</a>. All Rights
		Reserved.
	</span>
</footer>

<style>
	@keyframes fade-in-left {
		0% {
			opacity: 0;
			transform: translateX(-100%);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes fade-in-right {
		0% {
			opacity: 0;
			transform: translateX(0);
		}
		100% {
			opacity: 1;
			transform: translateX(-20%);
		}
	}

	@keyframes slide-down {
		0% {
			opacity: 0;
			transform: translateY(-50%);
		}
		100% {
			opacity: 1;
			transfrom: translateY(0);
		}
	}

	.animate-fade-in-left {
		animation-name: fade-in-left;
		animation-duration: 1s;
		animation-fill-mode: both;
	}

	.animate-fade-in-right {
		animation-name: fade-in-right;
		animation-duration: 1s;
		animation-fill-mode: both;
	}

	.animate-slide-down {
		animation: slide-down;
		animation-duration: 1s;
		animation-fill-mode: both;
	}
</style>
