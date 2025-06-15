<script>
    import { Card, Button, clickOutside } from "flowbite-svelte";
    import { ArrowRightOutline } from "flowbite-svelte-icons";

    let { labName = "Lab Name", labDesc = "Lab Description", thumbnail = "src/assets/comlabs/comlab2.jpg" } = $props();
</script>

<div class="space-y-4">
    <Card img={thumbnail} href="src/routes/room/room.html?labCode=1" class="bg-primary-300/50 hover:bg-primary-200 shadow-none transition-shadow duration-100 cursor-pointer hover:shadow-lg hover:shadow-secondary-200/50
    backdrop-blur-md outline-2 outline-dashed outline-secondary-200 " imgClass=" border-b-2 border-dashed border-primary-300/50">
        <div class="m-6">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-offwhite dark:text-white">{labName}</h5>
        <p class="mb-3 leading-tight font-normal text-offwhite/80 dark:text-gray-400">{labDesc}</p>
        </div>
    </Card>
</div>