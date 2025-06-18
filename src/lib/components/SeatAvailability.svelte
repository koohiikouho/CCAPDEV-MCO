<script lang="ts">
    import { Datepicker, Label, Radio, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Timepicker } from "flowbite-svelte";
  import SeatAvailabilityTable from "./SeatAvailabilityTable.svelte";

    let selectedDate = $state<Date | undefined>(undefined);

    let selectedTimeRange = $state({ time: "09:00", endTime: "17:00" });
    
    function handleRangeChange(data: { time: string; endTime: string; [key: string]: string }): void {
        if (data) {
        selectedTimeRange = {
            time: data.time,
            endTime: data.endTime
        };
        }
    }

</script>


<div class="bg-offwhite rounded-lg p-10">
    <div class="grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
      <div class="grow">
        <Datepicker inline bind:value={selectedDate} class="h-100 w-auto" classes={{grid: "h-80 w-auto"}}/>
        <Label class="my-3">Select Time Range:</Label>
          <Timepicker type="range" onselect={handleRangeChange} value={selectedTimeRange.time} endValue={selectedTimeRange.endTime} divClass="shadow-none"/>
      </div>
      <div>
        <SeatAvailabilityTable/>
      </div>
      <div>

        
      </div>
    </div>
  </div>