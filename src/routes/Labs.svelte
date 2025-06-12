<script>
    import { Card, Button } from "flowbite-svelte";
    import { ArrowRightOutline } from "flowbite-svelte-icons";
    import LabCard from "../lib/components/LabCard.svelte";
    import { slide } from "svelte/transition";

    let vCard = false;
    let labCardsData = [
        {labName: "GK 211 Laboratory", 
        labDesc: "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!"},
        {labName: "GK 210 Laboratory", 
        labDesc: "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!"},
        {labName: "GK 210 Laboratory", 
        labDesc: "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!"},
        {labName: "GK 210 Laboratory", 
        labDesc: "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!"},        
        {labName: "GK 210 Laboratory", 
        labDesc: "Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!"},

    ]    

    
</script>

<div class="flex flex-row min-h-screen justify-center items-center">
    <div class="h-auto bg-primary-200 w-screen md:w-350">
        <div class="mt-20"></div>
        <div class="">
            <h1 class="text-white">Labs</h1>

            <div class="flex justify-center pt-10 gap-10 flex-wrap">
                {#each labCardsData as labCardsData}
                    <LabCard labName={labCardsData.labName} labDesc={labCardsData.labDesc} />
                {/each}
                
    



            </div>
        </div>
    
    </div>
</div>
