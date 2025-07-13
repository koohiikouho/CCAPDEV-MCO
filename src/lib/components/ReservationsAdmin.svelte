<script lang="ts">
  import axios from "axios";
  import { TableSearch, ButtonGroup, Button, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Modal } from "flowbite-svelte";
  import { Section } from "flowbite-svelte-blocks";
  import { ChevronLeftOutline, ChevronRightOutline } from "flowbite-svelte-icons";

  interface Props {
    seatData : any;
  }
  let { seatData } : Props = $props();
  
  let divClass = 'bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden';
  let innerDivClass = 'flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4';
  let searchClass = 'w-full relative';

  let paginationData = seatData; 
  const itemsPerPage = 10;
  const showPage = 5;
  let totalPages = $state(0);
  let pagesToShow: number[] = $state([]);
  let totalItems = paginationData.length;
  let startPage: number;
  let endPage: number = $state(10);

  let searchTerm = $state('');
  let currentPosition = $state(0);

  console.log(paginationData);

  // Fixed filtering logic
  let filteredItems = $derived(
    paginationData.filter((item) => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const studentName = item.student_name || item.student?.name || "";
      const timeIn = item.time_in || "";
      const timeOut = item.time_out || "";
      const date = item.date || "";
      const column = item.column?.toString() || "";
      const row = item.row?.toString() || "";
      
      return (
        studentName.toLowerCase().includes(searchLower) ||
        timeIn.toLowerCase().includes(searchLower) ||
        timeOut.toLowerCase().includes(searchLower) ||
        date.toLowerCase().includes(searchLower) ||
        column.includes(searchLower) ||
        row.includes(searchLower)
      );
    })
  );

  // Use filtered items when searching, pagination when not
  let currentPageItems = $derived(
    searchTerm 
      ? filteredItems 
      : paginationData.slice(currentPosition, currentPosition + itemsPerPage)
  );

  // Update counts and pagination based on search state
  $effect(() => {
    if (searchTerm) {
      totalItems = filteredItems.length;
      currentPosition = 0; // Reset pagination when searching
    } else {
      totalItems = paginationData.length;
    }
    renderPagination(totalItems);
  });

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

  let startRange = $derived(searchTerm ? 1 : currentPosition + 1);
  let endRange = $derived(searchTerm ? filteredItems.length : Math.min(currentPosition + itemsPerPage, totalItems));

  $effect(() => {
    // Call renderPagination when the component initially mounts
    renderPagination(paginationData.length);
  });

  // Helper function to get student name consistently
  function getStudentName(item: any) {
    return item.student_name || item.student?.name || "Anonymous";
  }

  // Helper function to check if student is anonymous
  function isAnonymous(item: any) {
    const studentName = getStudentName(item);
    return studentName === "Anonymous" || item.is_anonymous;
  }

  let tempId = $state(), tempIn = $state(), tempOut = $state(), tempCol = $state(), tempRow = $state(), tempUser = $state();

  function openModal(reservationId, timeIn, timeOut, col, row, user_id){

    defaultModal = true;
    tempId=reservationId;
    tempIn=timeIn;
    tempOut=timeOut;
    tempCol=col;
    tempRow=row;
    tempUser=user_id;

  }
  
  const createReservation = async ( resid, reservationData) => {
    console.log(reservationData);
    try {
      const response = await axios.put('http://localhost:3000/reservations/'.concat(resid), reservationData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Reservation edited successfully!'
      };
    } catch (error) {
      console.error('Edit Reservation error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create reservation',
        details: error.response?.data?.details || error.message
      };
    }
  };

  async function putEditReservation(){
    const result = await createReservation(tempId, {
      time_in: tempIn,
      time_out: tempOut,
      column: tempCol,
      row: tempRow
    })

    if (result.success) {
      alert('Reservation successful!');
      console.log('Created reservations:', result.data.reservations);
    } else {
      alert('Reservation Edit Unsuccessful'.concat(result.error));

    }
  } 

  let defaultModal = $state(false);
</script>

<Section name="advancedTable" sectionClass="bg-offwhite dark:bg-gray-900 rounded-lg" >
  <TableSearch placeholder="Search by name, time, date, or seat..." hoverable={true} bind:inputValue={searchTerm} {divClass} {innerDivClass} {searchClass} inputClass="w-full text-center">
    <TableHead>
      <TableHeadCell class="px-0.5 md:px-4 py-3" scope="col">Student</TableHeadCell>
      <TableHeadCell class="px-0.5 md:px-4 py-3" scope="col">Time In</TableHeadCell>
      <TableHeadCell class="px-0.5 md:px-4 py-3" scope="col">Time Out</TableHeadCell>
      <TableHeadCell class="px-0.5 md:px-4 py-3" scope="col">Date</TableHeadCell>
      <TableHeadCell class="px-0.5 md:px-4 py-3" scope="col">Col</TableHeadCell>
      <TableHeadCell class="px-0.5 md:px-4 py-3" scope="col">Row</TableHeadCell>
      <TableHeadCell class="px-0.5 md:px-4 py-3" scope="col">Actions</TableHeadCell>
    </TableHead>
    <TableBody class="divide-y">
      {#each currentPageItems as item (item.id || item)}
        <TableBodyRow>
          {#if !isAnonymous(item)}
            <a href={`/src/routes/profiles/viewProfile.html?userCode=${item.user_id}`}>
              <TableBodyCell class="px-0.5 md:px-4 py-3 hover:text-blue-600 cursor-pointer">
                {getStudentName(item)}
              </TableBodyCell>
            </a>
          {:else}
            <TableBodyCell class="px-0.5 md:px-4 py-3">
              {getStudentName(item)}
            </TableBodyCell>
          {/if}
          <TableBodyCell class="px-0.5 md:px-4 py-3">{item.time_in || 'N/A'}</TableBodyCell>
          <TableBodyCell class="px-0.5 md:px-4 py-3">{item.time_out || 'N/A'}</TableBodyCell>
          <TableBodyCell class="px-0.5 md:px-4 py-3">{item.created_at || 'N/A'}</TableBodyCell>
          <TableBodyCell class="px-0.5 md:px-4 py-3">{item.column || 'N/A'}</TableBodyCell>
          <TableBodyCell class="px-0.5 md:px-4 py-3">{item.row || 'N/A'}</TableBodyCell>
          <TableBodyCell class="px-0.5 md:px-4 py-3 flex justify-end">
            <Button class="cursor-pointer bg-tertiary-400 hover:bg-tertiary-500 transition-colors" onclick={ () => openModal(item.reservation_id, item.timestamp_in, item.timestamp_out, item.column, item.row, item.user_id ) } >
              Edit
            </Button >
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
    {#snippet footer()}
      <div class="flex flex-col items-start justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0" aria-label="Table navigation">
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
          Showing
          <span class="font-semibold text-gray-900 dark:text-white">{startRange}-{endRange}</span>
          of
          <span class="font-semibold text-gray-900 dark:text-white">{totalItems}</span>
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


<Modal title="Edit Reservation" bind:open={defaultModal} autoclose>
  <form>
    <div class="form-group">
      <label for="reservationId">Reservation ID:</label>
      <input 
        type="text" 
        id="reservationId" 
        value={tempId} 
        readonly 
      />
    </div>
    <div class="form-group">
      <label for="user">User:</label>
      <input 
        type="text" 
        id="user" 
        bind:value={tempUser} 
        readonly
        required
      />
    </div>
    
    <div class="form-group">
      <label for="checkIn">Time In:</label>
      <input 
        type="datetime-local" 
        id="checkIn" 
        bind:value={tempIn} 
        required
      />
    </div>
    
    <div class="form-group">
      <label for="checkOut">Time Out:</label>
      <input type="datetime-local" id="checkOut" bind:value={tempOut} required
      />
    </div>
    
    <div class="form-group">
      <label for="column">Column:</label>
      <input 
        type="text" 
        id="column" 
        bind:value={tempCol} 
        required
      />
    </div>
    
    <div class="form-group">
      <label for="row">Row:</label>
      <input 
        type="text" 
        id="row" 
        bind:value={tempRow} 
        required
      />
    </div>
  </form>
  
  {#snippet footer()}
    <Button type="submit" value="success" onclick={putEditReservation}>Edit</Button>
    <Button type="submit" value="decline" color="alternative" >Cancel</Button>
  {/snippet}
</Modal>