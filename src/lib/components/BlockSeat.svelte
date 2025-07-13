<script lang="ts">
    import { Label, Datepicker, Timepicker, Button, Accordion, AccordionItem, Avatar, Input, Range, Radio } from "flowbite-svelte";
    import { ArrowLeftOutline, CalendarMonthSolid, ClockSolid, MapPinSolid, TheatreOutline, UserCircleOutline } from "flowbite-svelte-icons";
  	import { fade, fly, scale } from 'svelte/transition';
    let {studentData, schedule, labCode} = $props();
  
    let paginationData = studentData;


    let selectedDate = $state(new Date("2024-06-30"));
    let idNumberVar = $state("");



    let eventDuration = $state("0.5");
    let eventType = $state([]);
 

    let isAnonymousVar = $state(false);

    const isAnonymous = () => {
      isAnonymousVar = true;
    }
    const isNotAnonymous = () => {
      isAnonymousVar = false;
    }

  function timeIntervalFunc(opening, closing) {

    // Helper function to parse time string (e.g., "7:30", "15:00") into minutes
    function parseTime(timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    }
    
    // Helper function to format minutes back to time string
    function formatTime(totalMinutes) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Convert opening and closing times to minutes
    const openingMinutes = parseTime(opening);
    const closingMinutes = parseTime(closing);
    
    // Generate array of time intervals
    const intervals = [];
    
    // Start from opening time and add 30-minute intervals until closing time
    for (let time = openingMinutes; time <= closingMinutes; time += 30) {
      intervals.push(formatTime(time));
    }
    
    intervals.pop();
    return intervals;
  }
  let selectedInlineTime = $derived({ time: "12:00" });
  let timeIntervals = $derived( timeIntervalFunc(schedule[ (selectedDate.getDay() + 6) % 7].opening, schedule[(selectedDate.getDay() + 6) % 7 ].closing) );

  

    function handleTimeSelect(data: { time: string; endTime: string; [key: string]: string }): void {
      if (data) {
        selectedInlineTime = {
          time: data.time
        };
      }
    }
    let stepValue = 2.5;

    import { MultiSelect } from "flowbite-svelte";
  import axios from "axios";
  import StudentPicker from "./StudentPicker.svelte";


    async function getLabSeats() {
      let params = new URLSearchParams(location.search);
      let roomCode: string = params.get("labCode");
      let getSeatsURL = "http://localhost:3000/lab-seats/".concat(roomCode);

      const res = await fetch(getSeatsURL);
      const data = await res.json();

      return data.seats;

    }


    const createReservation = async (reservationData) => {
      console.log(reservationData);
      try {
        const response = await axios.post('http://localhost:3000/admin/reservations', reservationData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        return {
          success: true,
          data: response.data,
          message: 'Reservation created successfully!'
        };
      } catch (error) {
        console.error('Reservation error:', error.response?.data || error.message);
        
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to create reservation',
          details: error.response?.data?.details || error.message
        };
      }
    };

    function dateToStringLocal(date) {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return null;
      }
      
      return date.toLocaleDateString('en-CA'); // 'en-CA' format is YYYY-MM-DD
    }

    const postReservation = async () =>{
     const result = await createReservation({
        date: dateToStringLocal(selectedDate),
        time_start: selectedInlineTime.time,
        hours: Number(eventDuration),
        user_id: idNumberVar,
        lab_id: labCode,
        isAnonymous: isAnonymousVar,
        seats: Object.values(eventType)
      })
      console.log 
      
      if (result.success) {
        alert('Reservation successful!');
        console.log('Created reservations:', result.data.reservations);
      } else {
        defaultModal = true;
      }

    }
    
    let defaultModal = $state(false);




    let studentName : string = $state("");
    let viewSwitcher : boolean = $state(false);

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
              {#await getLabSeats() then seatData}
                <Label for="event-location" class="mb-2">Seat</Label>
                <MultiSelect items={seatData} bind:value={eventType}  size="md"/>
              {/await}
            </div>
            <div>
                <Label for="event-duration">Duration {eventDuration}Hour/s</Label>
                <Range id="range-steps" min="0.5" max="12" bind:value={eventDuration} step="0.5" />
            </div>
            <div>
              <div class="grid w-full gap-6">
                {#if viewSwitcher == false}
                <div transition:fly>
                  <StudentPicker paginationData={paginationData} bind:studentName={studentName} bind:idNumber={idNumberVar} bind:viewSwitcher={viewSwitcher} />
                </div>
                {:else}
                <div transition:fly>
                  
                  <Radio custom onclick={goBack}>
                    <div  class="dark:peer-checked:text-primary-500 peer-checked:border-primary-600 peer-checked:text-primary-600 inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                      <div class="flex align-center justify-center">
                        <ArrowLeftOutline class="mr-3" size="lg"/>
                        <div class="w-full text-lg font-semibold text-start">You will be reserving for {studentName} ID No. {idNumberVar}</div>
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
      <Button color="primary" class="w-full" onclick={postReservation}>Schedule Seat</Button>
    </div>
  </div>