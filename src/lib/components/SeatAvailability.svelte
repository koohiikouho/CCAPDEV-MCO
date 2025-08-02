<script lang="ts">
    import { Button, Datepicker, Label, Radio, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Timepicker } from "flowbite-svelte";
  import SeatAvailabilityTable from "./SeatAvailabilityTable.svelte";

    let defaultDate = new Date();
    let selectedDate = $state<Date | undefined>(defaultDate);

    let selectedTimeRange = $state({ time: "09:00", endTime: "17:00" });
    
    function handleRangeChange(data: { time: string; endTime: string; [key: string]: string }): void {
        if (data) {
        selectedTimeRange = {
            time: data.time,
            endTime: data.endTime
        };
        }
        console.log(availableSeatQuery);
    }

    function formatDate(date) {
    if (!date || !(date instanceof Date)) {
      return '';
    }
    
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

    //for GET shenanigans
    let params = new URLSearchParams(location.search);
    let roomCode: string = params.get("labCode");
    let getLabURL = "http://localhost:3000/labs/".concat(roomCode);

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const getLabData = async () => {
      const res = await fetch(getLabURL, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      return data[0];
    };

  let labData = getLabData();


  let availableSeatQuery = $derived(`http://localhost:3000/available-seats/${encodeURIComponent(roomCode)}?date=${encodeURIComponent(formatDate(selectedDate))}&time_in=${encodeURIComponent(selectedTimeRange.time)}&time_out=${encodeURIComponent(selectedTimeRange.endTime)}`);

  const getAvailableSeats = async (availableSeatQuery) => {
    const res = await fetch(availableSeatQuery, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
    const data = await res.json();

    return data.available_seats;
  };


  let tempData = $derived(getAvailableSeats(availableSeatQuery));
  let availableFrom = new Date();

</script>


<div class="bg-offwhite rounded-lg p-10">
    <div class="grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
      <div class="grow">
        <Datepicker inline bind:value={selectedDate} {defaultDate} {availableFrom} class="h-100 w-80 md:w-auto" classes={{grid: "h-80 w-73 md:w-auto"}}/>
        <Label class="my-3">Select Time Range:</Label>
        <Timepicker type="range" onselect={handleRangeChange} value={selectedTimeRange.time} endValue={selectedTimeRange.endTime} divClass="shadow-none"/>
      </div>
      <div>
      {#await getAvailableSeats(availableSeatQuery) then seatData}
        <SeatAvailabilityTable seatData={seatData}/>
      {/await}
      </div>
      <div>
      </div>
    </div>
  </div>