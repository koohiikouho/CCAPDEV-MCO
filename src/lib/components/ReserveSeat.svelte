<script lang="ts">
    import { Label, Datepicker, Timepicker, Button, Accordion, AccordionItem, Avatar, Input, Range, Radio, Modal, select } from "flowbite-svelte";
    import { CalendarMonthSolid, ClockSolid, MapPinSolid, TheatreOutline, UserCircleOutline } from "flowbite-svelte-icons";
    import axios from 'axios';
    let {userName = "Unknown", id = "Unknown", schedule, labCode} = $props();

    let selectedDate = $state(new Date());

    let eventDuration = $state("0.5");
    let eventType = $state([]);
 

    let isAnonymousVar = $state(false);

    const isAnonymous = () => {
      isAnonymousVar = true;
    }
    const isNotAnonymous = () => {
      isAnonymousVar = false;
    }

  function timeIntervalFunc(opening, closing, date = null) {
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

    // Get current time in minutes
    function getCurrentTimeInMinutes() {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    }

    // Check if the provided date is today
    function isToday(dateStr) {
      if (!dateStr) return true; // If no date provided, assume today
      
      const today = new Date();
      const providedDate = new Date(dateStr);
      
      return today.getFullYear() === providedDate.getFullYear() &&
            today.getMonth() === providedDate.getMonth() &&
            today.getDate() === providedDate.getDate();
    }

    // Convert opening and closing times to minutes
    const openingMinutes = parseTime(opening);
    const closingMinutes = parseTime(closing);
    const currentMinutes = getCurrentTimeInMinutes();
    const checkCurrentTime = isToday(date);

    // Generate array of time intervals
    const intervals = [];
    
    // Start from opening time and add 30-minute intervals until closing time
    for (let time = openingMinutes; time <= closingMinutes; time += 30) {
      // Only filter by current time if the date is today
      if (!checkCurrentTime || time >= currentMinutes) {
        intervals.push(formatTime(time));
      }
    }
    
    // Remove the last interval (closing time)
    intervals.pop();
    
    return intervals;
  }


  let selectedInlineTime = $derived({ time: "12:00" });
  let timeIntervals = $derived( timeIntervalFunc(schedule[ (selectedDate.getDay() + 6) % 7].opening, schedule[(selectedDate.getDay() + 6) % 7 ].closing, selectedDate) );

  

    function handleTimeSelect(data: { time: string; endTime: string; [key: string]: string }): void {
      if (data) {
        selectedInlineTime = {
          time: data.time
        };
      }
    }
    let stepValue = 2.5;

    import { MultiSelect } from "flowbite-svelte";


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
        const response = await axios.post('http://localhost:3000/reservations', reservationData, {
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
        user_id: id,
        lab_id: labCode,
        isAnonymous: isAnonymousVar,
        seats: Object.values(eventType)
      })
      console.log 
      
      if (result.success) {
        successModal = true;
        console.log('Created reservations:', result.data.reservations);
      } else {
        failModal = true;
        console.log('Failed to create reservation.');
      }

    }
    
    let failModal = $state(false);
    let successModal = $state(false);
    let availableFrom = new Date();
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
            <Datepicker bind:value={selectedDate} {availableFrom} inline />
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
                <Label for="event-duration">Duration {eventDuration}Hour/s</Label>
                <Range id="range-steps" min="0.5" max="12" bind:value={eventDuration} step="0.5" />
            </div>
            <div>
              <div class="grid w-full gap-6 md:grid-cols-2">
                <Radio name="custom" custom onclick={isAnonymous}>
                  <div class="dark:peer-checked:text-primary-500 peer-checked:border-primary-600 peer-checked:text-primary-600 inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                    <div>
                      <div class="w-full text-lg font-semibold text-start">Anonymous</div>
                      <div class="w-full">Your name will appear in the reservations list as Anonymous</div>
                    </div>
                    <TheatreOutline class="ms-3 h-10 w-10" />
                  </div>
                </Radio>
                <Radio name="custom" custom onclick={isNotAnonymous} >
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

<Modal bind:open={failModal} autoclose class="backdrop-blur-sm border-2 border-red-300 rounded-xl px-8 py-10 bg-white dark:bg-gray-900 shadow-md flex flex-col items-center space-y-5 text-center">

  <svg class="w-20 h-20 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 5a7 7 0 1 1 0 14a7 7 0 0 1 0-14z" />
  </svg>

  <h1 class="text-3xl font-bold text-red-600 dark:text-red-400">
    Reservation Failed
  </h1>

  <p class="text-gray-700 dark:text-gray-300 text-base">
    Something went wrong while submitting your reservation.<br/>
    Please try again later or contact support.
  </p>

  <button onclick={() => (failModal = false)} class="px-6 py-2 text-white font-medium rounded-full text-lg shadow-sm bg-red-500 hover:bg-red-600 transition-all">
    Try Again
  </button>

</Modal>


<Modal bind:open={successModal} autoclose class="backdrop-blur-sm border-2 border-green-300 rounded-xl px-8 py-10 bg-white dark:bg-gray-900 shadow-md flex flex-col items-center space-y-5 text-center">

  <svg class="w-20 h-20 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
  </svg>

  <h1 class="text-3xl font-bold text-green-600 dark:text-green-400">
    Reservation Confirmed!
  </h1>

  <p class="text-gray-700 dark:text-gray-300 text-base">
    Your reservation has been successfully submitted.<br/>
  </p>

  <button onclick={() => (successModal = false)} class="px-6 py-2 text-white font-medium rounded-full text-lg shadow-sm bg-green-500 hover:bg-green-600 transition-all">
    Done
  </button>

</Modal>
