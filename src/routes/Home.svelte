<script>
    import Particles from "../lib/components/Particles.svelte";
    import { Button, GradientButton } from "flowbite-svelte";
</script>


<div class="relative flex h-300 w-screen flex-col items-center justify-start overflow-hidden bg-background md:shadow-xl">

    <img src="../src/assets/logo.png" alt="logo" class="w-auto h-75 mt-50 mb-10">
    <span 
    class="pointer-events-none whitespace-pre-wrap bg-linear-to-tr from-primary-500 to-secondary-100 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
    >
        Reserve. Click. Done!
    </span>
    <br>
    <p class="text-tertiary-700 text-3xl">Instant computer lab bookings at your fingertips.</p>
    <div class="-z-10">
        <Particles className="absolute inset-0" refresh={true} />
    </div>

    <div class="flex mt-10 gap-10">
        <button type="button" 
        class="text-white bg-gradient-to-r from-primary-200 via-primary-300 to-primary-400 hover:bg-gradient-to-br 
        focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 shadow-lg shadow-primary-500/50 dark:shadow-lg 
        dark:shadow-primary-800/80 font-medium rounded-full text-lg px-5 py-2.5 text-center me-2 mb-2 pointer-events-auto w-auto h-13">
            Get Started
        </button>
        <button type="button" 
        class="text-white bg-gradient-to-r from-primary-200 via-primary-300 to-primary-400 hover:bg-gradient-to-br 
        focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-800 shadow-lg shadow-primary-500/50 dark:shadow-lg 
        dark:shadow-primary-800/80 font-medium rounded-full text-lg px-5 py-2.5 text-center me-2 mb-2 pointer-events-auto w-auto h-13">
            Learn More
        </button>

    </div>
</div>

