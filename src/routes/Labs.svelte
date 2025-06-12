<script>
    import { Card, Button, Thumbnail } from "flowbite-svelte";
    import { ArrowRightOutline } from "flowbite-svelte-icons";
    import LabCard from "../lib/components/LabCard.svelte";
    import { slide } from "svelte/transition";
    import Particles from "../lib/components/Particles.svelte";

    let vCard = false;
    let labCardsData = [
        {labName: "GK 211 Laboratory", 
        labDesc: "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!"},

        {labName: "GK 210 Laboratory", 
        labDesc: "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!"},

        {labName: "GK 403 Network Laboratory", 
        labDesc: "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!",
        thumbnail: "src/assets/comlabs/comlab1.jpg"},

        {labName: "GK 210 Laboratory", 
        labDesc: "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!"},  

        {labName: "GK 210 Laboratory", 
        labDesc: "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!"},

    ]    

    
</script>

<div class="flex flex-row min-h-screen justify-center items-center bg-primary-200">
    <div class="h-auto w-screen md:w-410 bg-offwhite z-10">
        <div class="mt-20"></div>
        <div class="">
            <h1 class="text-surface-500">Labs</h1>
            <div class="flex justify-center pt-10 gap-10 flex-wrap">
                {#each labCardsData as labCardsData}
                    <LabCard labName={labCardsData.labName} labDesc={labCardsData.labDesc} thumbnail={labCardsData.thumbnail}/>
                {/each}
            </div>
        </div>
    
    </div>
</div>


<div class="-z-10">
    <Particles className="absolute inset-0" refresh={true} color="#fcfcfc"/>
</div>