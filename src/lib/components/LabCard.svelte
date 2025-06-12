<script>
    import { Card, Button } from "flowbite-svelte";
    import { ArrowRightOutline } from "flowbite-svelte-icons";

    let { labName = "Lab Name", labDesc = "Lab Description" } = $props();

</script>

<div class="space-y-4">
    <Card img="/src/assets/comlabs/comlab2.jpg">
        <div class="m-6">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{labName}</h5>
        <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">{labDesc}</p>
        <Button class="w-51 fixcursor">
            Check Reservations <ArrowRightOutline class="ms-2 h-6 w-6 text-white "/>
        </Button>
        </div>
    </Card>
    </div>