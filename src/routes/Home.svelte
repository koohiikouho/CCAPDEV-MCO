<script>
	import { onMount } from 'svelte';
    import Particles from "../lib/components/Particles.svelte";
    import { Button, GradientButton, Heading, P, Span } from "flowbite-svelte";
	import { Modal } from "flowbite-svelte";

	let defaultModal = false;

	let user = {
		first_name: '',
		last_name: '',
		email: '',
		role: '',
		avatar: ''
	};

	onMount(async () => {
		const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

		// Checks if there is a token stored && the welcome modal has NOT been shown
		if (token && !sessionStorage.getItem('welcomeShown')) {
  			const userData = JSON.parse(atob(token.split('.')[1]));
			user = userData;
			defaultModal = true;
			sessionStorage.setItem('welcomeShown', 'true');
		}
	});
</script>

<Modal bind:open={defaultModal} autoclose class="backdrop-blur-sm border-2 border-primary-200 rounded-xl px-8 py-10 bg-white dark:bg-gray-900 shadow-md flex flex-col items-center space-y-5 text-center">
    
    <img src="/src/assets/logo.png" alt="Lab Club Logo" class="w-24 h-auto" />

    <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-200 via-primary-300 to-primary-400 bg-clip-text text-transparent dark:from-white dark:to-slate-500">
      Welcome, {user.first_name}!
    </h1>

    <p class="text-gray-700 dark:text-gray-300 text-base">
      You're now loged in to <span class="font-semibold">Lab Club</span> - your all-in-one<br/> lab reservation platform.
	</p>

    <button onclick={() => (defaultModal = false)} class="px-6 py-2 text-white font-medium rounded-full text-lg shadow-sm bg-blue-400 border-2 border-red-300 hover:bg-blue-500 transition-all">
      Let’s get started
    </button>
</Modal>


<div class="flex flex-col">
<div class="relative flex h-screen w-screen flex-col items-center justify-start overflow-hidden bg-background md:shadow-xl pb-50">

    <img src="/src/assets/logo.png" alt="logo" class="w-auto h-75 mt-25 md:mt-50 mb-10 opacity-90">
    <span 
    class="pointer-events-none whitespace-pre-wrap bg-linear-to-br from-primary-200 to-primary-600 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
    >
       Click. <span class="bg-linear-to-br from-secondary-200 to-secondary-600 bg-clip-text"> Reserve.</span>   <span class="animated-gradient">Done!</span>
    </span>
    <br>
    <p class="text-tertiary-700 text-xl/10 md:text-3xl/10">Instant computer lab bookings at your fingertips. <br/> <span class="animated-gradient-svelte">Powered by Svelte</span>; design <span class="animated-gradient-elysiajs">inspired by ElysiaJS.</span></p>
    <div class="-z-10">
        <Particles className="absolute inset-0" refresh={true} />
    </div>
    
    <div class="gap-5 mt-10 flex">
		<a href="../index.html?view=1">
			<button type="button" 
			class="text-white bg-gradient-to-r from-primary-200 via-primary-300 to-primary-400 hover:bg-gradient-to-br 
			focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 font-medium rounded-full text-lg px-5 py-2.5 text-center ml-2 mb-2 pointer-events-auto fixcursor">
				Get Started
			</button>
		</a>
		<a href="https://github.com/koohiikouho/CCAPDEV-MCO">
			<button type="button" 
			class="text-white bg-gradient-to-r from-secondary-200/70 via-secondary-300/70 to-secondary-400/70 hover:bg-gradient-to-br outline-offset-2 outline-primary-200
			focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 font-medium rounded-full text-lg px-5 py-2.5 text-center mb-2 pointer-events-auto fixcursor flex flex-row">
				<img src="/src/assets/github-mark-white.svg" alt="Github Logo" class="w-7 h-7 mr-3 color-primary-900"/>Github Repo
			</button>
		</a>

    </div>


</div>
	<div class="text-justify mx-5 md:ml-130 md:mr-200 mt-20 mb-30"> 
		<P class="text-justify text-surface-500">What is</P>
		  <Heading tag="h1" class="mb-4 text-start"><Span highlight="red">Lab Club?</Span></Heading>
		  <P class="text-surface-500 text-start">is a computer lab reservation system designed to streamline the booking process for academic institutions. 
			<br><br>
			It allows students, faculty, and staff to view real-time lab availability, reserve computer lab slots, and manage their bookings efficiently. 
			With user-friendly scheduling features and administrative controls, Lab Club helps optimize lab usage and reduce conflicts in shared spaces.</P>
	</div>
	<div class="text-end mx-5 md:ml-200 md:mr-130 mt-20 mb-30"> 
		<P class="text-end text-surface-500 mr-7">Why</P>
		  <Heading tag="h1" class="mb-4"><Span highlight="green">Lab Club?</Span></Heading>
		  <P class="text-surface-500 text-end">Lab Club addresses the common challenges of managing computer lab usage in schools and universities. 
			<br><br>
			It allows students, faculty, and staff to view real-time lab availability, reserve computer lab slots, and manage their bookings efficiently. 
			With user-friendly scheduling features and administrative controls, Lab Club helps optimize lab usage and reduce conflicts in shared spaces.</P>
	</div>
</div>




<style>
	.animated-gradient {
		--bg-size: 400%;
		--color-one: oklch(86% 0.1 126.06deg);
		--color-two: oklch(68.53% 0.1 18.56deg);
		

		background: linear-gradient(
									90deg,
									var(--color-one),
									var(--color-two),
									var(--color-one)
								) 0 0 / var(--bg-size) 100%;
		animation: move-bg 15s infinite linear;
		color: transparent;
		-webkit-background-clip: text;
		background-clip: none;
	}

	.animated-gradient-svelte {
		--bg-size: 400%;
		--color-one: rgba(255,62,0,255);
		--color-two: rgb(252,147,114);
		

		background: linear-gradient(
									90deg,
									var(--color-one),
									var(--color-two),
									var(--color-one)
								) 0 0 / var(--bg-size) 100%;
		animation: move-bg 30s infinite linear;
		color: transparent;
		-webkit-background-clip: text;
		background-clip: none;
	}
	.animated-gradient-elysiajs {
		--bg-size: 400%;
		--color-one: oklch(82.8% .111 230.318);
		--color-two: oklch(70.2% .183 293.541);
		

		background: linear-gradient(
									90deg,
									var(--color-one),
									var(--color-two),
									var(--color-one)
								) 0 0 / var(--bg-size) 100%;
		animation: move-bg 45s infinite linear;
		color: transparent;
		-webkit-background-clip: text;
        background-clip: none;
	}

	@keyframes move-bg {
		to {
			background-position: var(--bg-size) 0;
		}
	}
</style>