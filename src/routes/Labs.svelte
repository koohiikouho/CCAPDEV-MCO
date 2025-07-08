<script lang="ts">
  import { Card, Button, Input, Label, Hr} from "flowbite-svelte";
  import { ArrowRightOutline, ComputerSpeakerOutline, SearchOutline } from "flowbite-svelte-icons";
  import LabCard from "../lib/components/LabCard.svelte";
  import { fly, slide } from "svelte/transition";
  import Particles from "../lib/components/Particles.svelte";
  import { flip } from "svelte/animate";
  import Search from "../lib/components/Search.svelte";
  import { cubicOut } from "svelte/easing";
  import { onMount } from "svelte";

onMount( async () => {
  try {

    const res = await fetch(
      "http://localhost:3000/labs"
    );
    const data = await res.json();
    console.log(data[0].lab_name);
    labCardsData = data;
  }catch (err) {
      console.error("Failed to fetch labs:", err);
    }
});

  // const getLabs = async () => {
  //   const res = await fetch(
  //     "http://localhost:3000/labs"
  //   );
  //   const data = await res.json();
  //   console.log(data[0].lab_name);
  //   labCardsData = data;

  //   return true;
  // };
  

  let testing = $state();
  let labCardsData = $state([
  ]);

    
    let qty:number = 10;
    let vx:number = 0.1;
    let vy:number = 0.2;
    let size:number = 100;
    let staticity:number = 100;

    let value = $state("") ;
    let currentPageItems = $derived(labCardsData);
    let filteredItems = $derived(labCardsData.filter((item) => item.lab_name.concat(item.lab_name).toLowerCase().indexOf(value.toLowerCase()) !== -1));
    
</script>

<div class="-z-10">
    <Particles className="absolute inset-0" refresh={true} color="#ec8397" staticity={staticity} quantity={qty}
    size={size} vx={vx} vy={vy}/>
</div>



<div class="flex flex-row min-h-screen justify-center items-center bg-offwhite">
  <div class="h-auto w-screen md:w-370 bg-opacity-0 z-10">
    
    <div class="mt-20 px-60"></div>

    <div class="py-10 bg-tertiary-50/50 backdrop-blur-xs rounded-md outline-2 outline-secondary-50/60 outline-dashed">
      <h1 class="text-surface-600 font-bold md:text-start text-center pl-auto md:pl-9 flex flex-col md:flex-row items-center justify-center md:justify-between gap-5">
        <div class="flex items-end">
          <ComputerSpeakerOutline class="w-15 h-15 mr-5"/>Labs 
          <p>{testing}</p>
        </div> 
        <Input id="default-input" placeholder="Search Labs" class="pl-8 h-12" divClass="px-9 w-100" bind:value>
        {#snippet left()}
          <SearchOutline class="h-5 w-5 ml-8 text-gray-500 dark:text-gray-400" />
        {/snippet}
        </Input>
      </h1>

      <!-- <Hr class="bg-primary-300/70 " innerDivClass="bg-tertiary-50/50" divClass="px-10"> stuff goes here</Hr> -->
      <div class="flex justify-center pt-10 gap-y-10 gap-x-7 flex-wrap">
        {#each filteredItems as labCardsData, index}
          <div in:fly|global={{ y: 50, duration: index*100, delay: 100, easing: cubicOut }}>
            <LabCard
            labName={labCardsData.lab_name}
            thumbnail={labCardsData.image.src}
            labCode={labCardsData._id}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
