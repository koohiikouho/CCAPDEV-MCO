<script lang="ts">
  import { TableSearch, ButtonGroup, Button, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell } from "flowbite-svelte";
  import { Section } from "flowbite-svelte-blocks";
  import { ChevronLeftOutline, ChevronRightOutline } from "flowbite-svelte-icons";

  // import paginationData from '../../routes/room/advancedTable.json';

  interface Props {
    paginationData : any;
    viewSwitcher : boolean;
    studentName : string;
  }
  let { paginationData, viewSwitcher = $bindable(), studentName = $bindable() } : Props = $props();
  
  let divClass = 'bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden';
	let innerDivClass = 'flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4';
	let searchClass = 'w-full relative';



  const itemsPerPage = 10;
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

  function selectStudent(fromButton) {
    studentName = fromButton;
    viewSwitcher = true;

    console.log(viewSwitcher);
  }

</script>
<Section name="advancedTable" sectionClass="bg-offwhite dark:bg-gray-900 rounded-lg" >
    <TableSearch placeholder="Search" hoverable={true} bind:inputValue={searchTerm} {divClass} {innerDivClass} {searchClass} inputClass="w-full text-center">
      <TableHead>
        <TableHeadCell class="px-4 py-3" scope="col">User ID</TableHeadCell>
        <TableHeadCell class="px-4 py-3" scope="col">Student</TableHeadCell>
        <TableBodyCell class="px-4 py-3">Select User</TableBodyCell>    
      </TableHead>
      <TableBody class="divide-y">
        {#if searchTerm !== ''}
          {#each filteredItems as item (item.id)}
            <TableBodyRow>
              <TableBodyCell class="px-4 py-3">{1230000 + (j++) }</TableBodyCell>
              <TableBodyCell class="px-4 py-3">{item.student_name}</TableBodyCell>
         
            </TableBodyRow>
          {/each}
        {:else}
          {#each currentPageItems as item (item.id)}
            <TableBodyRow>
              <TableBodyCell class="px-4 py-3">{1230000 + (j++) }</TableBodyCell>
              <TableBodyCell class="px-4 py-3">{item.student_name}</TableBodyCell>
              <TableBodyCell class="px-4 py-3"><Button onclick={() => selectStudent(item.student_name)} class="cursor-pointer">Select Student</Button></TableBodyCell>
            </TableBodyRow>
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