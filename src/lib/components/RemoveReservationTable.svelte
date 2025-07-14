<script lang="ts">
  import axios from "axios";
  import { TableSearch, ButtonGroup, Button, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Table } from "flowbite-svelte";
  import { Section } from "flowbite-svelte-blocks";
  import { ChevronLeftOutline, ChevronRightOutline } from "flowbite-svelte-icons";

  // import paginationData from '../../routes/room/advancedTable.json';

  interface Props {
    paginationData : any;
  }
  let { paginationData } : Props = $props();
  
  let divClass = 'bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden';
	let innerDivClass = 'flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4';
	let searchClass = 'w-full relative';




  const itemsPerPage = 20;
	const showPage = 5;
	let totalPages = $state(0);
	let pagesToShow: number[] = $state([]);
	let totalItems = paginationData.length;
	let startPage: number;
	let endPage: number = $state(10);

  let searchTerm = $state('');
	let currentPosition = $state(0);

  let j = 0;


	const updateDataAndPagination = () => {
		let currentPageItems = paginationData.slice(currentPosition, currentPosition + itemsPerPage);
		renderPagination(currentPageItems.length);
	};

	const loadNextPage = () => {
		if (currentPosition + itemsPerPage < paginationData.length) {
			currentPosition += itemsPerPage;
			updateDataAndPagination();
		}
	};

	const loadPreviousPage = () => {
		if (currentPosition - itemsPerPage >= 0) {
			currentPosition -= itemsPerPage;
			updateDataAndPagination();
		}
	};

	const renderPagination = (totalItems: number) => {
		totalPages = Math.ceil(paginationData.length / itemsPerPage);
		const currentPage = Math.ceil((currentPosition + 1) / itemsPerPage);

		startPage = currentPage - Math.floor(showPage / 2);
		startPage = Math.max(1, startPage);
		endPage = Math.min(startPage + showPage - 1, totalPages);

		pagesToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
	};

	function goToPage (pageNumber: number) {
		currentPosition = (pageNumber - 1) * itemsPerPage;
		updateDataAndPagination();
	};

	let startRange = $derived(currentPosition + 1);
	let endRange = $derived(Math.min(currentPosition + itemsPerPage, totalItems));

	$effect(() => {
		// Call renderPagination when the component initially mounts
		renderPagination(paginationData.length);
	});

	let currentPageItems = $derived(paginationData.slice(currentPosition, currentPosition + itemsPerPage));
	let filteredItems = $derived(paginationData.filter((item) => item.student_name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1));

	async function delReservation(resId){
		const res = await axios.delete('http://localhost:3000/reservations/'.concat(resId));
    	alert("Reservation ".concat(resId).concat(" Removed Successfully!"));
	}

</script>
<Section name="advancedTable" sectionClass="bg-offwhite dark:bg-gray-900 rounded-lg" >
    <Table>
      <TableHead>
        <TableHeadCell class="px-1 md:px-4 py-3" scope="col">Seat</TableHeadCell>
        <TableHeadCell class="px-1 md:px-4 py-3" scope="col">Time Start</TableHeadCell>
        <TableHeadCell class="px-1 md:px-4 py-3" scope="col">Student</TableHeadCell>
        <TableBodyCell class="px-1 md:px-4 py-3"></TableBodyCell>    
      </TableHead>
      <TableBody class="divide-y">
        {#if searchTerm !== ''}
          {#each filteredItems as item (item)}
            <TableBodyRow>
              <TableBodyCell class="px-1 md:px-4 py-3">{item.seat}</TableBodyCell>
              <TableBodyCell class="px-1 md:px-4 py-3">{item.time_start}</TableBodyCell>
              <TableBodyCell class="px-1 md:px-4 py-3">{item.student_name}</TableBodyCell>
            </TableBodyRow>
          {/each}
        {:else}
          {#each currentPageItems as item (item)}
            <TableBodyRow>
              <TableBodyCell class="px-1 md:px-4 py-3">{item.seat}</TableBodyCell>
              <TableBodyCell class="px-1 md:px-4 py-3">{item.time_start}</TableBodyCell>
              <TableBodyCell class="px-1 md:px-4 py-3">{item.student_name}</TableBodyCell>
              <TableBodyCell class="px-1 md:px-4 py-3 justify-end align-end flex"><Button class="cursor-pointer" onclick={ () => delReservation(item.reservation_id)}>Delete Reservation</Button></TableBodyCell>
            </TableBodyRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  </Section>