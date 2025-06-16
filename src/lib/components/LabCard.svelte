<script>
    import { Card, ImagePlaceholder } from "flowbite-svelte";

    let { labName = "Lab Name", labDesc = "Lab Description", thumbnail = "/src/assets/comlabs/comlab2.jpg" } = $props();
    let removed = "bg-primary-300/50 outline-2 outline-dashed outline-secondary-200"
</script>

<div class="space-y-4">
    {#await thumbnail}
    <ImagePlaceholder/>
    {:then thumbnail}
    <Card img={thumbnail} href="/src/routes/room/room.html?labCode=1" class="bg-primary-50/20 rounded-md hover:opacity-80 hover:scale-110 hover:border-[0.5px] hover:border-primary-600 transition-transform shadow-none duration-100 cursor-pointer hover:shadow-lg hover:shadow-secondary-200/50
    backdrop-blur-md max-w-md text-start" imgClass="object-cover h-50 w-150 rounded-md rounded-b-none">
    <div class="m-2">
        <h5 class="text-xl tracking-tight text-surface-500 dark:text-white font-medium">{labName}</h5>
    </div>
    </Card>
    {/await}
</div>

