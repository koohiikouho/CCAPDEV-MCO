<script lang="ts">
	import { Section, Register } from 'flowbite-svelte-blocks';
	import { Button, Checkbox, Label, Input } from 'flowbite-svelte';



	import {Modal, P } from "flowbite-svelte";
	let defaultModal = $state(false);

	let result = $state(false);
	let value : string = $state();
	let regex = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/

	function dlsuCheck(){
		result = regex.test(value);
	}

</script>

<Section name="login" class="pt-20">
	<Register class="max-w-md mx-auto">
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6 outline-2 rounded-2xl outline-success-700">
			<form class="flex flex-col space-y-6" action="/">
				<div class="flex items-center justify-center space-x-2 flex-col">
					<img class="w-auto h-50" src="/src/assets/logo.png" alt="logo" />
					<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">Login</h3>
				</div>
				<Label class="space-y-2">
					<span>Your email</span>
					<Input type="email" name="email" placeholder="name@dlsu.edu.ph" required bind:value onInput={dlsuCheck}/>
				</Label>
				<Label class="space-y-2">
					<span>Your password</span>
					<Input type="password" name="password" placeholder="•••••" required />
				</Label>
				<div class="flex items-start">
					<Checkbox class="accent-primary-200 text-primary-200 focus:ring-primary-200 focus:ring-2">Remember me</Checkbox>
					<a href="#a" class="ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500" onclick={() => (defaultModal = true)}>Forgot password?</a>
				</div>
				<Modal title="Reset Password" bind:open={defaultModal} autoclose>
					<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Enter your email and we'll throw you a reset link!</p>
					<Input type="email" name="email" placeholder="name@dlsu.edu.ph" required bind:value onInput={dlsuCheck}/>		  
					{#snippet footer()}
					  <Button onclick={() => alert('Handle "success"')}>Send</Button>
					  <Button color="alternative">Cancel</Button>
					{/snippet}
				</Modal>

				{#if result}
				<Button type="submit" href="../../../index.html?signedIn=1"class="text-white bg-gradient-to-r from-success-500 via-success-600 to-success-700 hover:bg-gradient-to-br 
                focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 font-medium rounded-full text-lg px-5 py-2.5 text-center me-2 mb-2 pointer-events-auto fixcursor">Sign in</Button>
				{:else}
				<Button type="submit" class="text-white bg-gradient-to-r from-error-200 via-error-300 to-error-400 hover:bg-gradient-to-br 
                focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 font-medium rounded-full text-lg px-5 py-2.5 text-center me-2 mb-2 pointer-events-auto fixcursor" disabled>Sign in</Button>
				{/if}
				<p class="text-sm font-light text-gray-500 dark:text-gray-400">
					Don't have an account yet? <a href="/src/routes/signup/signup.html" class="text-primary-200 dark:text-primary-500 font-medium hover:underline">Sign up</a>
				</p>
				
			</form>
		</div>
	</Register>
</Section>