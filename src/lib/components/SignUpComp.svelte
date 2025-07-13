<script lang="ts">
	import { Section, Register } from 'flowbite-svelte-blocks';
	import { Button, Checkbox, Label, Input } from 'flowbite-svelte';
	import { Modal, P } from "flowbite-svelte";

	import { verifySignUp } from '../../../api/api.js';

	let checked = $state(false);
	let regex = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/
	let defaultModal = $state(false);

	let firstNameInput = $state("");
	let lastNameInput = $state("");
	let idNumberInput = $state("");
	let emailInput = $state("");
	let passwordInput = $state("");
	let passwordConfirmInput = $state("");
	let errors: string[] = $state([]);

async function handleSignUp(e: Event) {
		e.preventDefault();
		errors = [];

		if (!regex.test(emailInput)) {
			errors.push("Please enter a valid email address.");
			console.log("Invalid email address format: " + emailInput);
		}
		
		if (idNumberInput.length < 8) {
			errors.push("Please enter a valid ID number address.");
			console.log("Invalid ID number length.");
		}

		if (passwordInput.length < 8) {
			errors.push("Password must be at least 8 characters.");
			console.log("Invalid password length.");
		}

		if (passwordInput !== passwordConfirmInput) {
			errors.push("Passwords do not match.");
			console.log("Passwords do not match.");
		}

		if (errors.length > 0) {
			return;
		}

		try {

			// Call backend to verify signup
			const data = await verifySignUp(firstNameInput, lastNameInput, idNumberInput, emailInput, passwordInput);

			// If the backend sent an error, handle it
			if (data.error) {
				errors.push(data.error);
				return;
			}

			// Signup successful - store the token and user data
			localStorage.setItem('accessToken', data.accessToken);
			console.log('Login successful:', data.user);

			// Redirect to homepage w/ modal
			window.location.href = "../../../index.html";
		} catch (err) {
			console.error("Login failed:", err);
		}
	}
	
</script>

<Section name="register" class="pt-10">
	<Register class="max-w-md mx-auto">
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6 outline-2 rounded-2xl outline-secondary-700">
			<form class="flex flex-col space-y-6" onsubmit={handleSignUp}>
				<div class="flex items-center flex-col justify-center space-x-2">
					<img class="h-50 w-auto" src="/src/assets/logo.png" alt="logo" />
					<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">Create account</h3>
				</div>
				<Label class="space-y-2">
					<span>Your first name</span>
					<Input type="firstName" name="firstName" placeholder="e.g. John" bind:value={firstNameInput} required />
				</Label>
				<Label class="space-y-2">
					<span>Your last name</span>
					<Input type="lastName" name="lastName" placeholder="e.g. Doe" bind:value={lastNameInput} required />
				</Label>
				<Label class="space-y-2">
					<span>Your ID number</span>
					<Input type="idNumber" name="firstName" placeholder="e.g. 12345678" bind:value={idNumberInput} required />
				</Label>
				<Label class="space-y-2">
					<span>Your email</span>
					<Input type="email" name="email" placeholder="name@dlsu.edu.ph" bind:value={emailInput} required />
				</Label>
				<Label class="space-y-2">
					<span>Your password</span>
					<Input type="password" name="password" placeholder="•••••" bind:value={passwordInput} required />
				</Label>
				<Label class="space-y-2">
					<span>Confirm password</span>
					<Input type="password" name="confirm-password" placeholder="•••••" bind:value={passwordConfirmInput} required />
				</Label>
				<div class="flex items-start">
					<Checkbox class="accent-primary-200 text-primary-200 focus:ring-primary-200 focus:ring-2" bind:checked>I accept the&nbsp;<a href="#a" class="text-primary-200 dark:text-primary-500 font-medium hover:underline" onclick={() => (defaultModal = true)}> Terms and Conditions</a></Checkbox>
				</div>

				<Modal title="Terms of Service" bind:open={defaultModal} autoclose>
					<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 text-left">
						Last Updated: 06/18/2025

						Welcome to Lab Club. <br>
						By creating an account, you agree to comply with and be bound by the following terms and conditions . Please read them carefully before proceeding.<br>
						<br>
						1. Account Eligibility<br>
						1.1 You must be at least 18 years old or have legal guardian consent to create an account.<br>
						1.2 You agree to provide accurate, current, and complete information during registration.<br>
						1.3 Accounts are for individual use only, sharing accounts is prohibited.<br>
						<br>
						2. Account Security<br>
						2.1 You are responsible for maintaining the confidentiality of your login credentials.<br>
						2.2 You must notify us immediately of any unauthorized account access or security breaches.<br>
						2.3 We reserve the right to suspend or terminate accounts with suspicious activity.<br>
						<br>
						3. Reservation Policies<br>
						3.1 Lab reservations are subject to availability and must comply with posted scheduling rules.<br>
						3.2 Cancellations must be made within the specified timeframe to avoid penalties.<br>
						3.3 Repeated no-shows may result in account suspension.<br>
						<br>
						4. User Conduct<br>
						4.1 You agree not to misuse the Website for illegal, fraudulent, or harmful activities.<br>
						4.2 Any disruptive behavior (e.g., spam, harassment) may result in account termination.<br>
						4.3 You must comply with all lab safety and usage guidelines while on-site.<br>
						<br>
						5. Privacy & Data Use<br>
						5.1 Your personal data will be handled per our Privacy Policy.<br>
						5.2 We may send service-related emails (e.g., reservation confirmations).<br>
						<br>
						6. Modifications & Termination<br>
						6.1 We may update these Terms at any time; continued use constitutes acceptance.<br>
						6.2 We reserve the right to terminate accounts violating these Terms without notice.<br>
						<br>
						7. Limitation of Liability<br>
						7.1 We are not liable for indirect damages (e.g., lost time, data) arising from Website use.<br>
						7.2 We do not guarantee uninterrupted or error-free service.<br>
						<br>
						<br>
						By creating an account, you acknowledge that you have read, understood, and agreed to these Terms.
						<br>
						Contact Us:<br>
						For questions, contact labclub@dlsu.edu.ph.<br>
						<br>
						Lab Club
					</p>

					{#snippet footer()}
						<Button onclick={() => checked = true}>I accept</Button>
						<Button color="alternative" onclick={() => checked = false}>Decline</Button>
					{/snippet}
				</Modal>
				{#if errors.length > 0}
					<ul class="text-sm text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
						{#each errors as err}
							<li>{err}</li>
						{/each}
					</ul>
				{/if}

				{#if checked}
				<Button type="submit" class="text-white bg-gradient-to-r from-primary-200 via-primary-300 to-primary-400 hover:bg-gradient-to-br 
                focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 font-medium rounded-full text-lg px-5 py-2.5 text-center me-2 mb-2 pointer-events-auto fixcursor">Create an account</Button>
				{:else}
				<Button type="submit" class="text-white bg-gradient-to-r from-primary-200 via-primary-300 to-primary-400 hover:bg-gradient-to-br 
                focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 font-medium rounded-full text-lg px-5 py-2.5 text-center me-2 mb-2 pointer-events-auto fixcursor" disabled>Create an account</Button>
				{/if}
				<div class="text-sm font-medium text-gray-500 dark:text-gray-300">
					Already have an account? <a href="/src/routes/login/login.html" class="text-primary-200 dark:text-primary-500 font-medium hover:underline">Login here</a>
				</div>
			</form>
		</div>
	</Register>
</Section>