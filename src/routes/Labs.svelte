<script>
    import { Card, Button, Toggle } from "flowbite-svelte";
    import { ArrowRightOutline } from "flowbite-svelte-icons";
    let vCard = false;

</script>

<div class="flex flex-row min-h-screen justify-center items-center">
    <div class="h-screen overflow-hidden bg-primary-200 w-400">
        <div class="mt-20"></div>
        <div class="">
            <h1 class="text-white">Labs</h1>

            <div class="flex px-20 pt-10 gap-10">
                
                <div class="space-y-4">
                <Card img="/src/assets/comlabs/comlab2.jpg" reverse={vCard}>
                    <div class="m-6">
                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">GK 210 Laboratory</h5>
                    <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!</p>
                    <Button class="w-51">
                        Check Reservations <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
                    </Button>
                    </div>
                </Card>
                </div>

                <div class="space-y-4">
                <Card img="/src/assets/comlabs/comlab2.jpg" reverse={vCard}>
                    <div class="m-6">
                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">GK 210 Laboratory</h5>
                    <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Air-Conditioned Room equipped with 3 large TVs on each side. It's quite chilly in here so remember to bring a jacket!</p>
                    <Button class="w-51">
                        Check Reservations <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
                    </Button>
                    </div>
                </Card>
                </div>

            </div>
        </div>
    
    </div>
</div>
