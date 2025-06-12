<script>
    import Particles from "../lib/components/Particles.svelte";
    import { Button, GradientButton } from "flowbite-svelte";
</script>

<div class="flex flex-col">
<div class="relative flex h-auto w-screen flex-col items-center justify-start overflow-hidden bg-background md:shadow-xl pb-50">

    <img src="/src/assets/logo.png" alt="logo" class="w-auto h-75 mt-25 md:mt-50 mb-10 opacity-90">
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

    <div class="bg-primary-200 w-auto h-auto -z-10 p-auto">


    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi laoreet augue id sem interdum, eu gravida est scelerisque. Pellentesque fringilla viverra eros, in cursus dui viverra non. Fusce turpis nunc, vestibulum eu cursus et, auctor eu lorem. Aliquam malesuada auctor ornare. Morbi ultricies congue augue, vel sodales erat rhoncus non. Etiam tempus, libero vel volutpat vestibulum, orci ante malesuada libero, a mattis quam ipsum a urna. Sed varius aliquet dui, a tempor nibh bibendum in. Vestibulum volutpat mauris tellus, feugiat iaculis neque tristique vitae. Cras vestibulum velit non suscipit tempor. Suspendisse sit amet elit fermentum, pretium velit id, volutpat sapien. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras lobortis tellus augue, vel luctus nibh mollis luctus. Suspendisse eu nisi ut sapien pulvinar auctor. Phasellus ac mi ut nunc varius pellentesque. Etiam interdum odio eu molestie iaculis.

    In lobortis, metus quis scelerisque cursus, ipsum lorem bibendum urna, ac cursus ipsum magna ut arcu. Mauris commodo finibus dolor, ultricies malesuada orci vehicula in. Nunc hendrerit nulla massa, sit amet ullamcorper ante gravida eu. Donec euismod dui turpis, quis lobortis tellus consequat et. Sed sed dui massa. Nulla consequat condimentum malesuada. In a varius purus. Cras id porta lectus. Donec dictum sit amet urna a fermentum. Aenean id neque a quam dignissim sodales. Quisque fermentum dolor quis sem rhoncus iaculis.

    Donec vel dui felis. Proin et eros arcu. Nullam ut mauris tellus. Fusce eget urna mauris. Praesent at metus eu turpis facilisis tempus a nec libero. Mauris felis lorem, efficitur ut dui quis, efficitur vehicula neque. Morbi ornare efficitur viverra. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas sed lectus nibh.

    Quisque accumsan accumsan mauris, non dignissim nibh pellentesque commodo. Duis rutrum tortor sapien, nec feugiat justo pellentesque eget. Cras aliquam placerat orci. In et ex scelerisque, sagittis nibh quis, maximus odio. Ut elementum euismod pharetra. Suspendisse ac tempor tortor. Aenean eu facilisis arcu. Phasellus posuere hendrerit interdum. Nullam tempus ipsum id velit faucibus aliquam. Nulla eu accumsan massa. Nam finibus aliquet risus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin dictum et sapien tincidunt lobortis. Vestibulum dictum tempus venenatis.

    Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer a lectus sed leo convallis venenatis id vel tellus. Aenean dapibus rutrum felis. Praesent efficitur mattis placerat. Ut egestas, urna sit amet commodo dictum, mi augue aliquam metus, nec pulvinar orci lorem quis augue. Aenean sit amet dolor eu eros placerat placerat. Nunc accumsan felis ut mollis tincidunt. Proin suscipit rhoncus congue. Vestibulum massa diam, fermentum in risus eget, mattis pulvinar lacus. Duis a ipsum porttitor, feugiat neque et, sagittis risus. Quisque ut hendrerit dolor, eu tincidunt mi. Aenean ac ornare massa. 
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
	}

	@keyframes move-bg {
		to {
			background-position: var(--bg-size) 0;
		}
	}
</style>