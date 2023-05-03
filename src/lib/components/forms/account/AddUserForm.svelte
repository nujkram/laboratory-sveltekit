<script>
	// @ts-nocheck
	export let title;
	export let isModal2Open = false;
	export let loadStudent = () => {};
	// import bcrypt from 'bcryptjs';
	import { SHA256 } from 'crypto-js';

	let firstName = '',
		lastName = '',
		username = '',
		email = '',
		phone = '',
		province = '',
		country = '',
		password = '';

	const handleClose = () => {
		isModal2Open = false;
	};

	async function handleSubmit(event) {
		event?.preventDefault();

		// const salt = await bcrypt.genSalt(saltCount);
		const hashedPassword = await SHA256(password).toString();
		// const bcryptPass = await bcrypt.hash(hashedPassword, salt);

		const response = await fetch('/api/admin/user/insert', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				firstName,
				lastName,
				username,
				password: hashedPassword,
				phone,
				province,
				country,
				email
			})
		});
		let result = await response.json();
		isModal2Open = false;
		if (result.status === 'Success') {
			loadStudent();
		}
	}
</script>

<div class="fixed z-10 inset-0 overflow-y-auto {isModal2Open ? 'block' : 'hidden'}">
	<div class="flex items-center justify-center min-h-screen">
		<div class="fixed inset-0 bg-gray-500 bg-opacity-75" />
		<div
			class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full mx-auto"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-headline"
		>
			<div class="p-6">
				<h2 class="text-lg font-medium leading-6 text-gray-900" id="modal-headline">
					{title}
				</h2>
				<div class="mt-4">
					<form class="max-w-lg mx-auto" on:submit={handleSubmit}>
						<div class="mb-4">
							<label for="firstName" class="block mb-2 font-bold text-gray-700">First Name:</label>
							<input
								type="text"
								id="firstName"
								name="firstName"
								bind:value={firstName}
								class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
							/>
						</div>
						<div class="mb-4">
							<label for="lastName" class="block mb-2 font-bold text-gray-700">Last Name:</label>
							<input
								type="text"
								id="lastName"
								name="lastName"
								bind:value={lastName}
								class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
							/>
						</div>
						<div class="mb-4">
							<label for="username" class="block mb-2 font-bold text-gray-700">Username:</label>
							<input
								type="text"
								id="username"
								name="username"
								bind:value={username}
								class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
							/>
						</div>
						<div class="mb-4">
							<label for="password" class="block mb-2 font-bold text-gray-700">Password:</label>
							<input
								type="password"
								id="password"
								name="password"
								bind:value={password}
								class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
							/>
						</div>
						<div class="mb-4">
							<label for="email" class="block mb-2 font-bold text-gray-700">Email:</label>
							<input
								type="email"
								id="email"
								name="email"
								bind:value={email}
								class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
							/>
						</div>
						<div class="mb-4">
							<label for="phone" class="block mb-2 font-bold text-gray-700">Phone Number:</label>
							<input
								type="tel"
								id="phone"
								name="phone"
								bind:value={phone}
								class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
							/>
							<div class="mb-4">
								<label for="province" class="block mb-2 font-bold text-gray-700">Province:</label>
								<input
									type="text"
									id="province"
									name="province"
									bind:value={province}
									class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
								/>
							</div>
							<div class="mb-4">
								<label for="country" class="block mb-2 font-bold text-gray-700">Country:</label>
								<select
									id="country"
									name="country"
									bind:value={country}
									class="w-48 px-4 py-2 text-gray-700 bg-white border rounded shadow appearance-none focus:outline-none focus:shadow-outline class:active:bg-gray-100 class:focus:outline-none class:focus:bg-gray-100"
								>
									<option value="" disabled selected>Select an option</option>
									<option value="Argentina">Argentina</option>
									<option value="Australia">Australia</option>
									<option value="Brazil">Brazil</option>
									<option value="Chinese">Chinese</option>
									<option value="Italy">Italy</option>
									<option value="Japan">Japan</option>
									<option value="Philippines">Philippines</option>
									<option value="South Korea">South Korea</option>
								</select>
							</div>
						</div>
						<div class="text-center">
							<button
								type="submit"
								class="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700 focus:outline-none focus:shadow-outline"
								>Submit</button
							>
						</div>
					</form>
				</div>
			</div>
			<div class="p-2 bg-gray-100 text-right">
				<button
					type="button"
					class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
					on:click={handleClose}
				>
					Close
				</button>
			</div>
		</div>
	</div>
</div>
