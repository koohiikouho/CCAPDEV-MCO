<script lang="ts">
  import "../../app.css";
  import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch, Button, Checkbox, ButtonGroup, List, Li, Table, Label } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
	import paginationData from './advancedTable.json';
	import { PlusOutline, ChevronDownOutline, FilterSolid, ChevronRightOutline, ChevronLeftOutline } from 'flowbite-svelte-icons';
  import { Tabs, TabItem } from "flowbite-svelte";

	let divClass = 'bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden';
	let innerDivClass = 'flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4';
	let searchClass = 'w-full relative';
  let grid="w-full";

  import Particles from "../../lib/components/Particles.svelte";
  import { Datepicker } from "flowbite-svelte";
	let searchTerm = $state('');
	let currentPosition = $state(0);
  import { Range } from "flowbite-svelte";
  

  let activeClass = "inline-block text-md font-medium text-center disabled:cursor-not-allowed active rounded-t-lg dark:bg-gray-800 p-4 w-auto md:w-100 text-primary-600 border-x-2 border-t-2 border-primary-600 dark:text-primary-500 dark:border-primary-500 bg-offwhite"
  let inactiveClass = "inline-block text-sm font-medium text-center disabled:cursor-not-allowed rounded-t-lg hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-surface-300 dark:text-gray-400 bg-transparent bg-offwhite/50";

	const itemsPerPage = 10;
	const showPage = 5;
	let totalPages = $state(0);
	let pagesToShow: number[] = $state([]);
	let totalItems = paginationData.length;
	let startPage: number;
	let endPage: number = $state(10);

  let divider:boolean = false;

  let qty:number = 50;
  let vx:number = -0.2;
  let vy:number = -0.3;
  let size:number = 50;
  let staticity:number = 100;

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
	let filteredItems = $derived(paginationData.filter((item) => item.student_name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1));

  import {
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    P,
    ControlButton,
    Controls,
    Hr,
    Heading,
    A
  } from "flowbite-svelte";
  // import Labs from './routs/Labs.svelte';
  import { slide } from "svelte/transition";
  import { expoIn } from "svelte/easing";
  import {
    Avatar,
    Dropdown,
    DropdownHeader,
    DropdownItem,
    DropdownGroup,
  } from "flowbite-svelte";

  import { Carousel, Indicators } from "flowbite-svelte";
  import { AngleRightOutline, ArrowLeftOutline } from "flowbite-svelte-icons";

  export const images = [
    {
      alt: "image1",
      src: "https://www.dlsu.edu.ph/wp-content/uploads/2022/02/eml-1.jpg",
      title: "comlab2",
    },
    {
      alt: "image2",
      src: "https://www.dlsu.edu.ph/wp-content/uploads/2018/09/f-7.jpg",
      title: "comlab1",
    },
  ];

  let profilePic =
    "https://media.discordapp.net/attachments/1369208787042304020/1382885082166988963/profilepic.jpg?ex=684cc798&is=684b7618&hm=f49d3cb733fa975b82484a2b7cf1f49308ad5db839b5439c8d00fa4a96ce8b4d&=&format=webp&width=792&height=792";

  const views = [];

  let navbar = null;
  let navbarText = null;

  

  let viewportComponent = null;
  let currentView = 0;
  let userName = "Kasane Teto";
  let userEmail = "kasaneteto@utau.com";

  function viewHome() {
    currentView = 0;

    navbar.add();
    updateViewportComponent();
  }

  function viewLabs() {
    currentView = 1;

    navbar.add();
    updateViewportComponent();
  }

  function updateViewportComponent() {
    viewportComponent = views[currentView];
  }
  updateViewportComponent();



  let selectedDate = $state<Date | undefined>(undefined);

  // document.getElementById("homebutton").addEventListener("click", viewHome);

  let params = new URLSearchParams(location.search);

  let roomCode = params.get("labCode");
   
  let stepValue = $state("0730");
</script>

<header>
  <div id="navbar" class="text-white w-screen shadow-md">
    <Navbar
      class="p-0 fixed start-0 top-0 z-20 bg-white/30 hover:bg-surface-50/60 transition backdrop-blur-xl"
    >
      <NavBrand href="../../../">
        <img
          src="/src/assets/logolite.png"
          class="me-3 h-6 sm:h-9 text-surface-400 object-fill"
          alt="Lab Club Logo"
        />
        <span
          id="navbarText"
          class="self-center text-xl font-semibold whitespace-nowrap dark:text-white text-surface-400"
          >Lab Club!</span
        >
      </NavBrand>
      <NavHamburger />
      <NavUl>
        <NavLi
          href="#"
          class="text-surface-400"
          bind:this={navbarText}
          onclick={viewLabs}>Labs</NavLi
        >
        <NavLi href="#" class="text-surface-400">Users</NavLi>
        <NavLi href="#" class="text-surface-400">About</NavLi>
        <Avatar id="user-drop" src={profilePic} class="cursor-pointer ml-5" />
        <Dropdown triggeredBy="#user-drop" class="mt-5 bg-primary-200">
          <DropdownHeader>
            <span class="block text-sm text-white">{userName}</span>
            <span class="block truncate text-sm font-medium text-white"
              >{userEmail}</span
            >
          </DropdownHeader>
          <DropdownGroup class="text-white">
            <DropdownItem>Profile</DropdownItem>
            <DropdownItem>Reservations</DropdownItem>
          </DropdownGroup>
          <DropdownGroup class="text-white">
            <DropdownItem>Sign out</DropdownItem>
          </DropdownGroup>
        </Dropdown>
      </NavUl>
    </Navbar>
  </div>
</header>


<div class="relative z-10 px-auto md:px-60 ">



<div class="mt-35"></div>

<div class="grid grid-cols-2 h-auto w-auto pt-4 bg-tertiary-50/40 backdrop-blur-xs rounded-t-2xl outline-2 outline-secondary-50/60 outline-dashed">

  <div class="flex items-center flex-col px-2 py-4 ">
    <Heading tag="h1" class="">GK210 Computer Lab</Heading>
    <div class="flex justify-center md:justify-start items-center px-5 pt-2">
      Labs <AngleRightOutline class="size-5"/> Gokongwei <AngleRightOutline class="size-5"/> 2nd Floor <AngleRightOutline class="size-5"/> Room 10
    </div>
  
    <div class="flex justify-center md:justify-start items-center px-5 pt-10">
      Lipsum
    </div>

  </div>
  <div class="py-5 mx-2">
    <Carousel {images} duration={5000} class="w-auto" imgClass="rounded-xl">
      <Indicators />
    </Carousel>
  </div>






  <div class=" mt-4"> </div>
</div>
<div class ="bg-tertiary-50/40 backdrop-blur-xs rounded-b-2xl p-2 outline-2 outline-secondary-50/60 outline-dashed">
  <div class="bg-primary-200/50 rounded-3xl p-1">
    <Tabs tabStyle="none" class="flex divide-x divide-gray-200 rounded-lg shadow-sm rtl:divide-x-reverse dark:divide-gray-700" contentClass="bg-primary m-0 p-0 px-4 pb-4" 
      divider={divider}>

      <TabItem class="w-full" activeClass={activeClass} inactiveClass={inactiveClass} open>
        {#snippet titleSlot()}
          <span>Seat Availability</span>
        {/snippet}
        <div class="bg-offwhite rounded-xl p-10">
          <div class="grid grid-cols-2">
            <div class="">
              <Datepicker inline bind:value={selectedDate} class="h-100 w-150" classes={{grid: "h-80 w-140"}}/>
              <Label>Time: {stepValue} </Label>
              <Range id="range-steps" min="0730" max="1930" bind:value={stepValue} step="30" inputClass="w-fit"/>
            </div>
            <div>
              <Table striped={true}>
                <TableHead>
                  <TableHeadCell>Product name</TableHeadCell>
                  <TableHeadCell>Color</TableHeadCell>
                  <TableHeadCell>Category</TableHeadCell>
                  <TableHeadCell>Price</TableHeadCell>
                  <TableHeadCell>
                    <span class="sr-only">Edit</span>
                  </TableHeadCell>
                </TableHead>
                <TableBody>
                  <TableBodyRow>
                    <TableBodyCell>Apple MacBook Pro 17"</TableBodyCell>
                    <TableBodyCell>Sliver</TableBodyCell>
                    <TableBodyCell>Laptop</TableBodyCell>
                    <TableBodyCell>$2999</TableBodyCell>
                    <TableBodyCell>
                      <a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a>
                    </TableBodyCell>
                  </TableBodyRow>
                  <TableBodyRow>
                    <TableBodyCell>Microsoft Surface Pro</TableBodyCell>
                    <TableBodyCell>White</TableBodyCell>
                    <TableBodyCell>Laptop PC</TableBodyCell>
                    <TableBodyCell>$1999</TableBodyCell>
                    <TableBodyCell>
                      <a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a>
                    </TableBodyCell>
                  </TableBodyRow>
                  <TableBodyRow>
                    <TableBodyCell>Magic Mouse 2</TableBodyCell>
                    <TableBodyCell>Black</TableBodyCell>
                    <TableBodyCell>Accessories</TableBodyCell>
                    <TableBodyCell>$99</TableBodyCell>
                    <TableBodyCell>
                      <a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a>
                    </TableBodyCell>
                  </TableBodyRow>
                  <TableBodyRow>
                    <TableBodyCell>Google Pixel Phone</TableBodyCell>
                    <TableBodyCell>Gray</TableBodyCell>
                    <TableBodyCell>Phone</TableBodyCell>
                    <TableBodyCell>$799</TableBodyCell>
                    <TableBodyCell>
                      <a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a>
                    </TableBodyCell>
                  </TableBodyRow>
                  <TableBodyRow>
                    <TableBodyCell>Apple Watch 5</TableBodyCell>
                    <TableBodyCell>Red</TableBodyCell>
                    <TableBodyCell>Wearables</TableBodyCell>
                    <TableBodyCell>$999</TableBodyCell>
                    <TableBodyCell>
                      <a href="/tables" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Edit</a>
                    </TableBodyCell>
                  </TableBodyRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </TabItem>

      <TabItem class="w-full" activeClass={activeClass} inactiveClass={inactiveClass}>
        {#snippet titleSlot()}
          <span class="">Reservations</span>
        {/snippet}
        
        <Section name="advancedTable" sectionClass="bg-offwhite dark:bg-gray-900 rounded-xl" >
          <TableSearch placeholder="Search" hoverable={true} bind:inputValue={searchTerm} {divClass} {innerDivClass} {searchClass} inputClass="w-full text-center">
            <TableHead>
              <TableHeadCell class="px-4 py-3" scope="col">Student</TableHeadCell>
              <TableHeadCell class="px-4 py-3" scope="col">Time In</TableHeadCell>
              <TableHeadCell class="px-4 py-3" scope="col">Time Out</TableHeadCell>
              <TableHeadCell class="px-4 py-3" scope="col">Date</TableHeadCell>
              <TableHeadCell class="px-4 py-3" scope="col">Column</TableHeadCell>
              <TableHeadCell class="px-4 py-3" scope="col">Row</TableHeadCell>
            </TableHead>
            <TableBody class="divide-y">
              {#if searchTerm !== ''}
                {#each filteredItems as item (item.id)}
                  <TableBodyRow>
                    <TableBodyCell class="px-4 py-3">{item.student_name}</TableBodyCell>
                    <TableBodyCell class="px-4 py-3">{item.time_in}</TableBodyCell>
                    <TableBodyCell class="px-4 py-3">{item.time_out}</TableBodyCell>
                    <TableBodyCell class="px-4 py-3">{item.date}</TableBodyCell>
                    <TableBodyCell class="px-4 py-3">{item.seat_col}</TableBodyCell>
                    <TableBodyCell class="px-4 py-3">{item.seat_row}</TableBodyCell>
                  </TableBodyRow>
                {/each}
              {:else}
                {#each currentPageItems as item (item.id)}
                  <TableBodyRow>
                    <TableBodyCell class="px-4 py-3">{item.student_name}</TableBodyCell>
                    <TableBodyCell class="px-4 py-3">{item.time_in}</TableBodyCell>
                    <TableBodyCell class="px-4 py-3">{item.time_out}</TableBodyCell>
                    <TableBodyCell class="px-4 py-3">{item.date}</TableBodyCell>
                    <TableBodyCell class="px-4 py-3">{item.seat_col}</TableBodyCell>
                    <TableBodyCell class="px-4 py-3">{item.seat_row}</TableBodyCell>
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
      </TabItem>

      <TabItem class="w-full" activeClass={activeClass} inactiveClass={inactiveClass}>
        {#snippet titleSlot()}
          <span>Reserve Seat</span>
        {/snippet}
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <b>Dashboard:</b>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </TabItem>


    
    </Tabs>

    </div>

  </div>
</div>

<div class="-z-10 ">
  <Particles className="absolute z-0 inset-0" refresh={true} color="#ec8397" staticity={staticity} quantity={qty}
  size={size} vx={vx} vy={vy}/>
</div>

<div class="mt-10"></div>

<footer>Hello</footer>