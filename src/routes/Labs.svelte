<script lang="ts">
  import { Card, Button, Input, Label, Hr} from "flowbite-svelte";
  import { ArrowRightOutline, ComputerSpeakerOutline, SearchOutline } from "flowbite-svelte-icons";
  import LabCard from "../lib/components/LabCard.svelte";
  import { slide } from "svelte/transition";
  import Particles from "../lib/components/Particles.svelte";
  import { flip } from "svelte/animate";
  import Search from "../lib/components/Search.svelte";

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
  <div class="h-auto w-screen md:w-370 bg-opacity-0 z-10">
    
    <div class="mt-20 px-60"></div>

    <div class="py-10 bg-tertiary-50/50 backdrop-blur-xs rounded-md outline-2 outline-secondary-50/60 outline-dashed">
      <h1 class="text-surface-600 font-bold md:text-start text-center pl-auto md:pl-9 flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between gap-5">
        <div class="flex items-end">
          <ComputerSpeakerOutline class="w-15 h-15 mr-5"/>Labs 
        </div> 
        <Input id="default-input" placeholder="Search Lab" class="pl-8 h-12" divClass="px-9 w-100">
        {#snippet left()}
          <SearchOutline class="h-5 w-5 ml-8 text-gray-500 dark:text-gray-400" />
        {/snippet}
        </Input>
      </h1>

      <!-- <Hr class="bg-primary-300/70 " innerDivClass="bg-tertiary-50/50" divClass="px-10"> stuff goes here</Hr> -->
      <div class="flex justify-center pt-10 gap-y-10 gap-x-7 flex-wrap">
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
