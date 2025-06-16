<script lang="ts">
  import "../../app.css";
  import { TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch, Button, Checkbox, ButtonGroup, List, Li, Table, Label } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
	import paginationData from './advancedTable.json';
	import { ChevronRightOutline, ChevronLeftOutline } from 'flowbite-svelte-icons';
  import { Tabs, TabItem } from "flowbite-svelte";
  import { Timepicker } from 'flowbite-svelte';

  import SeatAvailability from '../../lib/components/SeatAvailability.svelte';
  import Reservations from "../../lib/components/Reservations.svelte";


  let grid="w-full";

  import Particles from "../../lib/components/Particles.svelte";
  

  let activeClass = "inline-block text-md font-medium text-center disabled:cursor-not-allowed active rounded-t-lg dark:bg-gray-800 p-4 w-auto md:w-100 text-primary-600 border-x-2 border-t-2 border-primary-600 dark:text-primary-500 dark:border-primary-500 bg-offwhite"
  let inactiveClass = "inline-block text-sm font-medium text-center disabled:cursor-not-allowed rounded-t-lg hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-surface-300 dark:text-gray-400 bg-transparent bg-offwhite/50";


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
  import {
    Avatar,
    Dropdown,
    DropdownHeader,
    DropdownItem,
    DropdownGroup,
  } from "flowbite-svelte";

  import { Carousel, Indicators } from "flowbite-svelte";
  import { AngleRightOutline, ArrowLeftOutline } from "flowbite-svelte-icons";
  import ReserveSeat from "../../lib/components/ReserveSeat.svelte";
  import DateAvailable from "../../lib/components/DateAvailable.svelte";
  import TempNavbar from "../../lib/components/TempNavbar.svelte";

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

  let qty:number = 50;
  let vx:number = -0.2;
  let vy:number = -0.3;
  let size:number = 50;
  let staticity:number = 100;
  let divider:boolean = false;

</script>

<!-- <header>
  <div id="navbar" class="text-white w-screen shadow-md">
    <Navbar class="p-0 fixed start-0 top-0 z-20 bg-white/30 hover:bg-white/60 transition backdrop-blur-xl">
      <NavBrand href="../../">
        <img src="/src/assets/logolite.png" class="me-3 h-6 sm:h-9 text-surface-400 object-fill" alt="Lab Club Logo" />
        <span id="navbarText" class="self-center text-xl font-semibold whitespace-nowrap dark:text-white text-surface-400">Lab Club!</span>
      </NavBrand>
      <NavHamburger class="bg-surface-400 hover:bg-surface-600"/>
      <NavUl ulClass="items-center align-middle p-1">
          <NavLi href="../../../index.html?view=1" class="text-surface-400" onclick={viewLabs}>Labs</NavLi>
          <NavLi href="../../../index.html?view=2"class="text-surface-400" >Users</NavLi>
          <NavLi href="#a" class="text-surface-400">About</NavLi>
          <NavLi class="flex align-center">
            <Avatar id="user-drop" src="src/assets/profilepic.jpg" class="cursor-pointer"/>
            <Dropdown triggeredBy="#user-drop" class="mt-5 bg-primary-300/70" >
              <DropdownHeader>
                <span class="block text-sm text-white">{userName}</span>
                <span class="block truncate text-sm font-medium text-white">{userEmail}</span>
              </DropdownHeader>
              <DropdownGroup class="text-white ">
                <DropdownItem class="hover:text-surface-400">Profile</DropdownItem>
                <DropdownItem class="hover:text-surface-400 text-center w-full fixcursor" href="../../../index.html?view=5">Reservations</DropdownItem>
              </DropdownGroup>
              <DropdownGroup class="text-white">
                <DropdownItem class="hover:text-surface-400" href='/src/routes/login/login.html'>Login</DropdownItem>
                <DropdownItem class="hover:text-surface-400">Sign out</DropdownItem>
              </DropdownGroup>
            </Dropdown>
          </NavLi>
      </NavUl>
    </Navbar>
  </div>
</header> -->

<TempNavbar userEmail={userEmail} userName={userName}/>


<div class="relative z-10 px-auto md:px-60 ">



<div class="mt-35"></div>

<div class="grid md:grid-cols-2 h-auto w-auto pt-4 bg-tertiary-50/40 backdrop-blur-xs rounded-t-2xl outline-2 outline-secondary-50/60 outline-dashed">

  <div class="flex items-center flex-col px-2 py-4 ">
    <Heading tag="h1" class="">GK210 Computer Lab</Heading>
    <div class="flex justify-center md:justify-start items-center px-5 pt-2">
      Labs <AngleRightOutline class="size-5"/> Gokongwei <AngleRightOutline class="size-5"/> 2nd Floor <AngleRightOutline class="size-5"/> Room 10
    </div>
    <div class="flex justify-center md:justify-start items-center px-5 pt-5">
      Short description goes here
    </div>
    <div class="flex justify-center md:justify-start items-center px-5 pt-5 w-auto">
      <DateAvailable/>
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
        <SeatAvailability/>
      </TabItem>

      <TabItem class="w-full" activeClass={activeClass} inactiveClass={inactiveClass}>
        {#snippet titleSlot()}
          <span class="">Reservations</span>
        {/snippet}
        
        <Reservations/>
        
      </TabItem>

      <TabItem class="w-full" activeClass={activeClass} inactiveClass={inactiveClass}>
        {#snippet titleSlot()}
          <span>Reserve Seat</span>
        {/snippet}
        <ReserveSeat/>
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