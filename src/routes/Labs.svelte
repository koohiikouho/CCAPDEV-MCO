<script lang="ts">
  import { Card, Button} from "flowbite-svelte";
  import { ArrowRightOutline } from "flowbite-svelte-icons";
  import LabCard from "../lib/components/LabCard.svelte";
  import { slide } from "svelte/transition";
  import Particles from "../lib/components/Particles.svelte";
  import { flip } from "svelte/animate";

  let vCard = false;
  let labCardsData = [
    {
        labName: "GK 211 Laboratory",
        labDesc:
            "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!",
    },

    {
        labName: "GK 210 Laboratory",
        labDesc:
            "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!",
        thumbnail: "https://www.dlsu.edu.ph/wp-content/uploads/2018/09/f-16.jpg"
    },

    {
        labName: "GK 403 Network Laboratory",
        labDesc:
            "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!",
        thumbnail: "src/assets/comlabs/comlab1.jpg",
    },

    {
        labName: "GK 210 Laboratory",
        labDesc:
            "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!",
        thumbnail:
            "https://www.dlsu.edu.ph/wp-content/uploads/2018/09/f-8.jpg"
    },

    {
        labName: "AG 1703 Laboratory",
        labDesc:
            "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!",
        thumbnail:
            "https://www.dlsu.edu.ph/wp-content/uploads/2018/09/f-2-1024x768.jpg"
    },
  ];

    let qty:number = 10;
    let vx:number = 0.1;
    let vy:number = 0.2;
    let size:number = 100;
    let staticity:number = 100;

</script>

<div class="-z-10">
    <Particles className="absolute inset-0" refresh={true} color="#ec8397" staticity={staticity} quantity={qty}
    size={size} vx={vx} vy={vy}/>
</div>



<div class="flex flex-row min-h-screen justify-center items-center bg-offwhite">
  <div class="h-auto w-screen md:w-400 bg-opacity-0 z-10">
    
    <div class="mt-20 px-60"></div>

    <div class="py-10 bg-tertiary-50/50 backdrop-blur-xs rounded-md outline-2 outline-secondary-50/60 outline-dashed">
      <h1 class="text-surface-500">Labs</h1>
      <div class="flex justify-center pt-10 gap-2 flex-wrap">
        {#each labCardsData as labCardsData}
            <LabCard
            labName={labCardsData.labName}
            labDesc={labCardsData.labDesc}
            thumbnail={labCardsData.thumbnail}
            />
        {/each}
      </div>
    </div>
  </div>
</div>

<footer>
    Hello
</footer>