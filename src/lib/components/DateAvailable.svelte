<script lang="ts">
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";

    interface Props {
        labDays: any;
    }
    let { labDays }: Props = $props();

    function processLabDays(item){
        if(item.opening == false){
          item.opening = "Closed";
        }

        if(item.closing == false){
          item.closing = "Closed";
        }
    }
    labDays.forEach(processLabDays);

  </script>
  
  <Table striped={true} divClass="w-auto" class="rounded-xl" >
    <TableHead class="text-center w-auto">
        <TableHeadCell>Schedule</TableHeadCell>
        <TableHeadCell class="px-2">Mon</TableHeadCell>
        <TableHeadCell class="px-3">Tue</TableHeadCell>
        <TableHeadCell class="px-3">Wed</TableHeadCell>
        <TableHeadCell class="px-3">Thuy</TableHeadCell>
        <TableHeadCell class="px-3">Fri</TableHeadCell>
        <TableHeadCell class="px-3">Sat</TableHeadCell>
        <TableHeadCell class="px-3">Sun</TableHeadCell>    
    </TableHead>
    <TableBody>
      <TableBodyRow class="text-center w-auto">
        <TableBodyCell class="px-0">Opens</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[0].opening}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[1].opening}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[2].opening}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[3].opening}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[4].opening}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[5].opening}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[6].opening}</TableBodyCell>
      </TableBodyRow>
      <TableBodyRow class="text-center w-auto">
        <TableBodyCell class="px-0">Closes</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[0].closing}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[1].closing}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[2].closing}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[3].closing}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[4].closing}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[5].closing}</TableBodyCell>
        <TableBodyCell class="px-0">{labDays[6].closing}</TableBodyCell>
      </TableBodyRow>
    </TableBody>
  </Table>