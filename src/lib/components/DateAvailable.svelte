<script>
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
  </script>
  
  <Table striped={true} divClass="w-auto" class="rounded-xl" >
    <TableHead class="text-center w-auto">
        <TableHeadCell> Schedule </TableHeadCell>
        <TableHeadCell class="px-2">06-16</TableHeadCell>
        <TableHeadCell class="px-3">06-17</TableHeadCell>
        <TableHeadCell class="px-3">06-18</TableHeadCell>
        <TableHeadCell class="px-3">06-19</TableHeadCell>
        <TableHeadCell class="px-3">06-20</TableHeadCell>
        <TableHeadCell class="px-3">06-21</TableHeadCell>
        <TableHeadCell class="px-3">06-22</TableHeadCell>    
    </TableHead>
    <TableBody>
      <TableBodyRow class="text-center w-auto">
        <TableBodyCell class="px-0">Open</TableBodyCell>
        <TableBodyCell class="px-0">0730</TableBodyCell>
        <TableBodyCell class="px-0">0730</TableBodyCell>
        <TableBodyCell class="px-0">X</TableBodyCell>
        <TableBodyCell class="px-0">0730</TableBodyCell>
        <TableBodyCell class="px-0">0730</TableBodyCell>
        <TableBodyCell class="px-0">X</TableBodyCell>
        <TableBodyCell class="px-0">X</TableBodyCell>
      </TableBodyRow>
      <TableBodyRow class="text-center w-auto">
        <TableBodyCell class="px-0">Closed</TableBodyCell>
        <TableBodyCell class="px-0">1800</TableBodyCell>
        <TableBodyCell class="px-0">1800</TableBodyCell>
        <TableBodyCell class="px-0">X</TableBodyCell>
        <TableBodyCell class="px-0">1800</TableBodyCell>
        <TableBodyCell class="px-0">1800</TableBodyCell>
        <TableBodyCell class="px-0">X</TableBodyCell>
        <TableBodyCell class="px-0">X</TableBodyCell>
      </TableBodyRow>
    </TableBody>
  </Table>