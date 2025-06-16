<script lang="ts">
    import { Label, Datepicker, Timepicker, Button, Accordion, AccordionItem, Avatar, Input, Range } from "flowbite-svelte";
    import { CalendarMonthSolid, ClockSolid, MapPinSolid } from "flowbite-svelte-icons";
  
    let selectedDate = $state(new Date("2024-06-30"));
    let selectedInlineTime = $state({ time: "12:00" });
    let eventTitle = $state("Digital Transformation");
    let eventLocation = $state("California, USA");
    let eventDuration = $state("0.5");
    let eventType = $state(["A2"]);
    let participants = [
      { img: "/images/profile-picture-1.webp", alt: "Participant 1" },
      { img: "/images/profile-picture-2.webp", alt: "Participant 2" },
      { img: "/images/profile-picture-3.webp", alt: "Participant 3" }
    ];
  
    const timeIntervals = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"];
  
    function handleTimeSelect(data: { time: string; endTime: string; [key: string]: string }): void {
      if (data) {
        selectedInlineTime = {
          time: data.time
        };
      }
    }
    let stepValue = 2.5;

    import { MultiSelect } from "flowbite-svelte";

    let selected = [];
    let countries = [
    { value: "A1", name: "A1" },
    { value: "A2", name: "A2" },
    { value: "A3", name: "A3" },
    { value: "A4", name: "A4", disabled: true },
    { value: "A5", name: "A5", disabled: true }
    ];
  </script>
  
  <div class="mx-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
    <div class="p-6">
      <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Reserve a Seat Form</h2>
  
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

    <div class="px-6">
        <div class="space-y-4 border-t border-gray-200 py-6 ">
            <div>
                <Label for="event-location" class="mb-2">Seat</Label>
                <MultiSelect items={countries} bind:value={eventType}  size="md"/>
            </div>
            <div>
                <Label for="event-duration">Duration</Label>
                <Range id="range-steps" min="0.5" max="12" bind:value={eventDuration} step="0.5" />
            </div>

        </div>
    </div>


  
    <div class="border-t border-gray-200 p-6 dark:border-gray-700">
      <Button color="primary" class="w-full">Schedule Seat</Button>
    </div>
  </div>