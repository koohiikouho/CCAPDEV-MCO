<script lang="ts">
	import { Section, Register } from 'flowbite-svelte-blocks';
	import { Button, Checkbox, Label, Input } from 'flowbite-svelte';
</script>

<Section name="login" class="pt-40">
	<Register class="max-w-md mx-auto">
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
			<form class="flex flex-col space-y-6" action="/">
				<div class="flex items-center justify-center space-x-2">
					<img class="h-8 w-8" src="/src/assets/logo.png" alt="logo" />
					<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">Login</h3>
				</div>
				<Label class="space-y-2">
					<span>Your email</span>
					<Input type="email" name="email" placeholder="name@dlsu.edu.ph" required />
				</Label>
				<Label class="space-y-2">
					<span>Your password</span>
					<Input type="password" name="password" placeholder="•••••" required />
				</Label>
				<div class="flex items-start">
					<Checkbox class="accent-primary-200 text-primary-200 focus:ring-primary-200 focus:ring-2">Remember me</Checkbox>
					<a href="/" class="ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500">Forgot password?</a>
				</div>
				<Button type="submit" class="text-white bg-gradient-to-r from-primary-200 via-primary-300 to-primary-400 hover:bg-gradient-to-br 
                focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 font-medium rounded-full text-lg px-5 py-2.5 text-center me-2 mb-2 pointer-events-auto fixcursor">Sign in</Button>
				<p class="text-sm font-light text-gray-500 dark:text-gray-400">
					Don't have an account yet? <a href="/" class="text-primary-200 dark:text-primary-500 font-medium hover:underline">Sign up</a>
				</p>
			</form>
		</div>
	</Register>
</Section>