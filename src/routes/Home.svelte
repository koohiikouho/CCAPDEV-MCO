<script>
    import Particles from "../lib/components/Particles.svelte";
    import { Button, GradientButton } from "flowbite-svelte";
</script>


<div class="relative flex h-250 w-screen flex-col items-center justify-start overflow-hidden bg-background md:shadow-xl">

    <img src="/src/assets/logo.png" alt="logo" class="w-auto h-75 mt-50 mb-10 opacity-90">
    <span 
    class="pointer-events-none whitespace-pre-wrap bg-linear-to-br from-primary-200 to-primary-600 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
    >
       Click. <span class="bg-linear-to-br from-secondary-200 to-secondary-600 bg-clip-text"> Reserve.</span>   <span class="animated-gradient">Done!</span>
    </span>
    <br>
    <p class="text-tertiary-700 text-3xl">Instant computer lab bookings at your fingertips.</p>
    <div class="-z-10">
        <Particles className="absolute inset-0" refresh={true} />
    </div>
    
    <div class="gap-10 mt-10">
        <button type="button" 
        class="text-white bg-gradient-to-r from-primary-200 via-primary-300 to-primary-400 hover:bg-gradient-to-br 
        focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 font-medium rounded-full text-lg px-5 py-2.5 text-center me-2 mb-2 pointer-events-auto fixcursor">
            Get Started
        </button>


        <button class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-lg font-medium text-primary-900 rounded-full group bg-gradient-to-br from-primary-200 to-primary-300
        group-hover:from-primary-600 group-hover:to-primary-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none 
        focus:ring-primary-300 dark:focus:ring-primary-800 fixcursor">
        <span class="relative px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-full  group-hover:bg-transparent group-hover:dark:bg-transparent">
            Learn More
        </span>
        </button>
    </div>


</div>

    <div class="bg-primary-200 w-screen h-100">

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
	}

	@keyframes move-bg {
		to {
			background-position: var(--bg-size) 0;
		}
	}
</style>