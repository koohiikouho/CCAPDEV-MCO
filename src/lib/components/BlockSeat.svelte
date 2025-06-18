<script lang="ts">
    import { Label, Datepicker, Timepicker, Button, Accordion, AccordionItem, Avatar, Input, Range, Radio } from "flowbite-svelte";
    import { ArrowLeftOutline, CalendarMonthSolid, ClockSolid, MapPinSolid, TheatreOutline, UserCircleOutline } from "flowbite-svelte-icons";
  	import { fade, fly, scale } from 'svelte/transition';
    let {paginationData} = $props();
  
    let selectedDate = $state(new Date("2024-06-30"));
    let selectedInlineTime = $state({ time: "7:30" });
    let eventDuration = $state("0.5");
    let eventType = $state(["A2"]);

    let studentName : string = $state("");
    let viewSwitcher : boolean = $state(false);

    const timeIntervals = ["7:30", "8:00", "8:30", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"];
3
    function handleTimeSelect(data: { time: string; endTime: string; [key: string]: string }): void {
      if (data) {
        selectedInlineTime = {
          time: data.time
        };
      }
    }
    let stepValue = 2.5;

  import { MultiSelect } from "flowbite-svelte";
  import StudentPicker from "./StudentPicker.svelte";
  

    let selected = [];
    let countries = [
    { value: "A1", name: "A1" },
    { value: "A2", name: "A2" },
    { value: "A3", name: "A3" },
    { value: "A4", name: "A4", disabled: true },
    { value: "A5", name: "A5", disabled: true }
    ];

    function goBack(){
      viewSwitcher = false;
    }


  </script>
  
  <div class="mx-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
    <div class="p-6">
      <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Block seat for a student form</h2>
  
      <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <Label class="mb-2">Location</Label>
        <span class="text-lg font-medium text-gray-900 dark:text-white">GK304</span>
        </div>
        <div>
          <Label class="mb-2">Duration</Label>
          <span class="text-lg font-medium text-gray-900 dark:text-white">{eventDuration}Hour/s</span>
        </div>
        <div>
          <Label class="mb-2">Seat</Label>
          <span class="text-lg font-medium text-gray-900 dark:text-white">{eventType}</span>
        </div>
      </div>
  
      <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label class="mb-2">Select Date</Label>
            <Datepicker bind:value={selectedDate} inline />
          </div>
          <div>
            <Label class="mb-2">Select Time</Label>
            <Timepicker type="inline-buttons" value={selectedInlineTime.time} {timeIntervals} onselect={handleTimeSelect} />
          </div>
        </div>
      </div>
    </div>

    <div class="md:px-6">
        <div class="space-y-4 border-t border-gray-200 py-6 ">
            <div>
                <Label for="event-location" class="mb-2">Seat</Label>
                <MultiSelect items={countries} bind:value={eventType}  size="md" class="mx-4"/>
            </div>
            <div>
                <Label for="event-duration">Duration: {eventDuration} hr/s</Label>
                <Range id="range-steps" min="0.5" max="12" bind:value={eventDuration} step="0.5" inputClass="w-90 md:w-full mb-5" />
            </div>
            <div>
              <div class="grid w-full gap-6">
                {#if viewSwitcher == false}
                <div transition:fly>
                  <StudentPicker paginationData={paginationData} bind:studentName={studentName} bind:viewSwitcher={viewSwitcher} />
                </div>
                {:else}
                <div transition:fly>
                  
                  <Radio custom onclick={goBack}>
                    <div  class="dark:peer-checked:text-primary-500 peer-checked:border-primary-600 peer-checked:text-primary-600 inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                      <div class="flex align-center justify-center">
                        <ArrowLeftOutline class="mr-3" size="lg"/>
                        <div class="w-full text-lg font-semibold text-start">You will be reserving for {studentName}</div>
                      </div>
                      <UserCircleOutline class="ms-3 h-10 w-10" />
                    </div>
                  </Radio>
                </div>
                {/if}
              </div> 
            </div>
        </div>
    </div>

    <div class="border-t border-gray-200 p-6 dark:border-gray-700">
      <Button color="primary" class="w-full">Schedule Seat</Button>
    </div>
  </div>