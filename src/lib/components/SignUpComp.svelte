<script lang="ts">
	import { Section, Register } from 'flowbite-svelte-blocks';
	import { Button, Checkbox, Label, Input } from 'flowbite-svelte';
	import { Modal, P } from "flowbite-svelte";

	let result = $state(false);
	let checked = $state(false);
	let value : string = $state();
	let regex = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/
	let defaultModal = $state(false);

	function dlsuCheck(){
		result = regex.test(value);
	}
	
</script>

<Section name="register" class="pt-20">
	<Register class="max-w-md mx-auto">
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6 outline-2 rounded-2xl outline-secondary-700">
			<form class="flex flex-col space-y-6" action="/">
				<div class="flex items-center flex-col justify-center space-x-2">
					<img class="h-50 w-auto" src="/src/assets/logo.png" alt="logo" />
					<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">Create account</h3>
				</div>
				<Label class="space-y-2">
					<span>Your email</span>
					<Input type="email" name="email" placeholder="name@dlsu.edu.ph" bind:value onInput={dlsuCheck} required />
				</Label>
				<Label class="space-y-2">
					<span>Your password</span>
					<Input type="password" name="password" placeholder="•••••" required />
				</Label>
				<Label class="space-y-2">
					<span>Confirm password</span>
					<Input type="password" name="confirm-password" placeholder="•••••" required />
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
						<Button onclick={() => alert('Handle "success"')}>I accept</Button>
						<Button color="alternative">Decline</Button>
					{/snippet}
				</Modal>

				{#if result && checked}
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