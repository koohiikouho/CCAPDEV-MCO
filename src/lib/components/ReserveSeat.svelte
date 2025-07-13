<script lang="ts">
    import { Label, Datepicker, Timepicker, Button, Accordion, AccordionItem, Avatar, Input, Range, Radio, Modal } from "flowbite-svelte";
    import { CalendarMonthSolid, ClockSolid, MapPinSolid, TheatreOutline, UserCircleOutline } from "flowbite-svelte-icons";

    let {userName = "Username"} = $props();
  
    let selectedDate = $state(new Date("2024-06-30"));
    let selectedInlineTime = $state({ time: "7:30" });
    let eventTitle = $state("Digital Transformation");
    let eventLocation = $state("California, USA");
    let eventDuration = $state("0.5");
    let eventType = $state([]);
    let participants = [
      { img: "/images/profile-picture-1.webp", alt: "Participant 1" },
      { img: "/images/profile-picture-2.webp", alt: "Participant 2" },
      { img: "/images/profile-picture-3.webp", alt: "Participant 3" }
    ];
  
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

    let selected = [];
    let countries = [
    { value: "A1", name: "A1" },
    { value: "A2", name: "A2" },
    { value: "A3", name: "A3" },
    { value: "A4", name: "A4", disabled: true },
    { value: "A5", name: "A5", disabled: true }
    ];

    async function getLabSeats() {
      let params = new URLSearchParams(location.search);
      let roomCode: string = params.get("labCode");
      let getSeatsURL = "http://localhost:3000/lab-seats/".concat(roomCode);

      const res = await fetch(getSeatsURL);
      const data = await res.json();
      console.log(data);
      return data.seats;

    }

    function postReservation(){

    }
      let defaultModal = $state(false);
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
              {#await getLabSeats() then seatData}
                <Label for="event-location" class="mb-2">Seat</Label>
                <MultiSelect items={seatData} bind:value={eventType}  size="md"/>

              {/await}
            </div>
            <div>
                <Label for="event-duration">Duration</Label>
                <Range id="range-steps" min="0.5" max="12" bind:value={eventDuration} step="0.5" />
            </div>
            <div>
              <div class="grid w-full gap-6 md:grid-cols-2">
                <Radio name="custom" custom>
                  <div class="dark:peer-checked:text-primary-500 peer-checked:border-primary-600 peer-checked:text-primary-600 inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                    <div>
                      <div class="w-full text-lg font-semibold text-start">Anonymous</div>
                      <div class="w-full">Your name will appear in the reservations list as Anonymous</div>
                    </div>
                    <TheatreOutline class="ms-3 h-10 w-10" />
                  </div>
                </Radio>
                <Radio name="custom" custom>
                  <div class="dark:peer-checked:text-primary-500 peer-checked:border-primary-600 peer-checked:text-primary-600 inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                    <div class="block">
                      <div class="w-full text-lg font-semibold text-start">Name included</div>
                      <div class="w-full">Your name will appear in the reservations list as {userName}</div>
                    </div>
                    <UserCircleOutline class="ms-3 h-10 w-10" />
                  </div>
                </Radio>
              </div>
            </div>
        </div>
    </div>

    <div class="border-t border-gray-200 p-6 dark:border-gray-700">
      <Button color="primary" class="w-full" onclick={postReservation}>Schedule Seat</Button>
    </div>
  </div>

<Modal title="Terms of Service" form bind:open={defaultModal} onaction={({ action }) => alert(`Handle "${action}"`)}>
  bro
  {#snippet footer()}
    <Button type="submit" value="success">I accept</Button>
    <Button type="submit" value="decline" color="alternative">Decline</Button>
  {/snippet}
</Modal>