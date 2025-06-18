<script lang="ts">
  import { TableSearch, ButtonGroup, Button, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, pagination } from "flowbite-svelte";
  import { Section } from "flowbite-svelte-blocks";
  import { ChevronLeftOutline, ChevronRightOutline } from "flowbite-svelte-icons";

  import paginationData from "../../routes/room/advancedTable.json";


  console.log(paginationData);


  let divClass = 'bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden';
	let innerDivClass = 'flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4';
	let searchClass = 'w-full relative';

  const itemsPerPage = 50;
	const showPage = 5;
	let totalPages = $state(0);
	let pagesToShow: number[] = $state([]);
	let totalItems = paginationData.length;
	let startPage: number;
	let endPage: number = $state(10);

  let searchTerm = $state('');
	let currentPosition = $state(0);



  // svelte-ignore non_reactive_update
  let i: number = 0;
  // svelte-ignore non_reactive_update
  let j: number = 0;

  function iAdd(){
    i++;
  }

  function jAdd(){
    j++;
  }

  function jClear(){
    j = 0;
  }
  function iClear(){
    i = 0
  }

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

	const goToPage = (pageNumber: number) => {
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
	let filteredItems = $derived(paginationData.filter((item) => item.seat_col.concat(item.seat_row).toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1));


</script>
<Section name="advancedTable" sectionClass="bg-offwhite dark:bg-gray-900 rounded-2xl" >
    <TableSearch placeholder="Input to Search Seat" hoverable={true} bind:inputValue={searchTerm} {divClass} {innerDivClass} {searchClass} inputClass="w-full text-center">
      <TableHead>
        <TableHeadCell colspan={5} class="text-center">Available Seats</TableHeadCell>
      </TableHead>
      <TableBody class="divide-y divide=x">
        {#if searchTerm !== ''}
        {iClear()}
        {jClear()}
          {#each filteredItems as item (item.id)}
            {iAdd()}
            {#if i % 5 === 0 && j != 0}
              <TableBodyRow/>
            {/if}
            {jAdd()}
            <TableBodyCell>
              <TableBodyRow class="px-4 py-3">{item.seat_col}{item.seat_row}</TableBodyRow>
            </TableBodyCell>
          {/each}
        {:else}
        {iClear()}
        {jClear()}
            {#each currentPageItems as item (item.id)}
              {iAdd()}
              {#if i % 5 === 0 && j != 0}
                <TableBodyRow/>
              {/if}
              {jAdd()}
              <TableBodyCell>
                <TableBodyRow class="px-4 py-3">{item.seat_col}{item.seat_row}</TableBodyRow>
              </TableBodyCell>
            {/each}
        {/if}
      </TableBody>
      {#snippet footer()}
        <div class="flex flex-col items-start justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0" aria-label="Table navigation">
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
            Showing
            <span class="font-semibold text-gray-900 dark:text-white">{startRange}-{endRange}</span>
            of
            <span class="font-semibold text-gray-900 dark:text-white">{totalItems}</span>
          </span>
          <ButtonGroup>
            <Button onclick={loadPreviousPage} disabled={currentPosition === 0}><ChevronLeftOutline size="xs" class="m-1.5" /></Button>
            {#each pagesToShow as pageNumber}
              <Button onclick={() => goToPage(pageNumber)}>{pageNumber}</Button>
            {/each}
            <Button onclick={loadNextPage} disabled={totalPages === endPage}><ChevronRightOutline size="xs" class="m-1.5" /></Button>
          </ButtonGroup>
        </div>
      {/snippet}
    </TableSearch>
  </Section>