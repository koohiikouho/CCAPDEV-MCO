<script lang="ts">
  import {
    TableSearch,
    ButtonGroup,
    Button,
    TableHead,
    TableHeadCell,
    TableBody,
    TableBodyRow,
    TableBodyCell,
    pagination,
  } from "flowbite-svelte";
  import { Section } from "flowbite-svelte-blocks";
  import {
    ChevronLeftOutline,
    ChevronRightOutline,
  } from "flowbite-svelte-icons";

  interface Props {
    seatData: any;
  }
  let { seatData }: Props = $props();


  let paginationData = seatData;

  console.log(paginationData);
  let divClass =
    "bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden";
  let innerDivClass =
    "flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4";
  let searchClass = "w-full relative";

  const itemsPerPage = 10;
  const showPage = 5;
  let totalPages = $state(0);
  let pagesToShow: number[] = $state([]);
  let totalItems = paginationData.length;
  let startPage: number;
  let endPage: number = $state(10);

  let searchTerm = $state("");
  let currentPosition = $state(0);

  // Fixed filtering logic
  let filteredItems = $derived(
    paginationData.filter((item) => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      
      // Get student name based on data structure
      const studentName = item.student_name || item.student?.name || "";
      
      // Search across multiple fields
      return (
        studentName.toLowerCase().includes(searchLower) ||
        item.time_in?.toLowerCase().includes(searchLower) ||
        item.time_out?.toLowerCase().includes(searchLower) ||
        item.seat_col?.toString().includes(searchLower) ||
        item.seat_row?.toString().includes(searchLower) ||
        item.column?.toString().includes(searchLower) ||
        item.row?.toString().includes(searchLower)
      );
    })
  );

  // Use filtered items for pagination when searching
  let itemsToDisplay = $derived(searchTerm ? filteredItems : paginationData);
  let currentPageItems = $derived(
    searchTerm 
      ? filteredItems 
      : paginationData.slice(currentPosition, currentPosition + itemsPerPage)
  );

  // Update total items based on search
  $effect(() => {
    totalItems = itemsToDisplay.length;
    if (searchTerm) {
      // Reset pagination when searching
      currentPosition = 0;
    }
    renderPagination(totalItems);
  });

  const updateDataAndPagination = () => {
    let currentPageItems = paginationData.slice(
      currentPosition,
      currentPosition + itemsPerPage
    );
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

    pagesToShow = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
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
</script>

<Section
  name="advancedTable"
  sectionClass="bg-offwhite dark:bg-gray-900 rounded-lg"
>
  <TableSearch
    placeholder="Search by name, time, or seat..."
    hoverable={true}
    bind:inputValue={searchTerm}
    {divClass}
    {innerDivClass}
    {searchClass}
    inputClass="w-full text-center"
  >
    <TableHead>
      <TableHeadCell class="px-1 md:px-4 py-3" scope="col">Student</TableHeadCell>
      <TableHeadCell class="px-1 md:px-4 py-3" scope="col">Time In</TableHeadCell>
      <TableHeadCell class="px-1 md:px-4 py-3" scope="col">Time Out</TableHeadCell>
      <TableHeadCell class="px-1 md:px-4 py-3" scope="col">Column</TableHeadCell>
      <TableHeadCell class="px-1 md:px-4 py-3" scope="col">Row</TableHeadCell>
    </TableHead>
    <TableBody class="divide-y">
      {#each currentPageItems as item (item)}
        <TableBodyRow>
          {#if (item.student_name && item.student_name !== "Anonymous") || (item.student?.name && !item.is_anonymous)}
            <a href={`/src/routes/profiles/viewProfile.html?userCode=${item.user_id}`}>
              <TableBodyCell class="px-1 md:px-4 py-3">
                {item.student.name}
              </TableBodyCell>
            </a>
          {:else}
            <TableBodyCell class="px-1 md:px-4 py-3">
              Anonymous
            </TableBodyCell>
          {/if}
          <TableBodyCell class="px-1 md:px-4 py-3">{item.time_in}</TableBodyCell>
          <TableBodyCell class="px-1 md:px-4 py-3">{item.time_out}</TableBodyCell>
          <TableBodyCell class="px-1 md:px-4 py-3">{item.seat_col || item.column}</TableBodyCell>
          <TableBodyCell class="px-1 md:px-4 py-3">{item.seat_row || item.row}</TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
    {#snippet footer()}
      <div
        class="flex flex-col items-start justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0"
        aria-label="Table navigation"
      >
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
          Showing
          <span class="font-semibold text-gray-900 dark:text-white">
            {searchTerm ? 1 : startRange}-{searchTerm ? filteredItems.length : endRange}
          </span>
          of
          <span class="font-semibold text-gray-900 dark:text-white">
            {totalItems}
          </span>
        </span>
        {#if !searchTerm}
          <ButtonGroup>
            <Button onclick={loadPreviousPage} disabled={currentPosition === 0}>
              <ChevronLeftOutline size="xs" class="m-1.5" />
            </Button>
            {#each pagesToShow as pageNumber}
              <Button onclick={() => goToPage(pageNumber)}>{pageNumber}</Button>
            {/each}
            <Button onclick={loadNextPage} disabled={totalPages === endPage}>
              <ChevronRightOutline size="xs" class="m-1.5" />
            </Button>
          </ButtonGroup>
        {/if}
      </div>
    {/snippet}
  </TableSearch>
</Section>