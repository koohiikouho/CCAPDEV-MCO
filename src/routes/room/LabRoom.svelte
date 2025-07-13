<script lang="ts">
  import "../../app.css";
  import { Tabs, TabItem } from "flowbite-svelte";

  let params = new URLSearchParams(location.search);
  let roomCode: string = params.get("labCode");

  import SeatAvailability from "../../lib/components/SeatAvailability.svelte";
  import Reservations from "../../lib/components/Reservations.svelte";

  let getLabURL = "http://localhost:3000/labs/".concat(roomCode);
  let getLabSeatsURL = "http://localhost:3000/reservations/".concat(roomCode);

  const getLabData = async () => {
    const res = await fetch(getLabURL);
    const data = await res.json();
    images.pop();
    images.push(data.image);
    return data;
  };


  const getLabSeats = async () => {
    const res = await fetch(getLabSeatsURL);
    const data = await res.json();
    return data;
  };
  const getStudentData = async () =>{
    const res = await fetch("http://localhost:3000/admin/students");
    const data = await res.json();
    return data;
  }



  import Particles from "../../lib/components/Particles.svelte";

  let activeClass =
    "inline-block text-md font-medium text-center disabled:cursor-not-allowed active rounded-t-lg dark:bg-gray-800 p-4 w-auto md:w-70 text-primary-600 border-x-2 border-t-2 border-primary-600 dark:text-primary-500 dark:border-primary-500 bg-offwhite";
  let inactiveClass =
    "inline-block cursor-pointer text-sm font-medium text-center disabled:cursor-not-allowed rounded-t-lg hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-surface-300 dark:text-gray-400 bg-transparent bg-offwhite/50";

  import { Heading } from "flowbite-svelte";
  // import Labs from './routs/Labs.svelte';

  import { Carousel, Indicators } from "flowbite-svelte";
  import { AngleRightOutline, ArrowLeftOutline } from "flowbite-svelte-icons";
  import ReserveSeat from "../../lib/components/ReserveSeat.svelte";
  import DateAvailable from "../../lib/components/DateAvailable.svelte";
  import TempNavbar from "../../lib/components/TempNavbar.svelte";
  import BlockSeat from "../../lib/components/BlockSeat.svelte";
  import RemoveReservationTable from "../../lib/components/RemoveReservationTable.svelte";
  import ReservationsAdmin from "../../lib/components/ReservationsAdmin.svelte";
  import { onMount } from 'svelte';
  

    let viewportComponent = null;
    let currentView = 0;
    let userName = $state("Guest");
    let userEmail = $state("Sign in to reserve");
    let profilePicture = $state("https://i.pinimg.com/236x/08/35/0c/08350cafa4fabb8a6a1be2d9f18f2d88.jpg");
    let isLoggedIn: boolean = $state(false);
    let userRole: string = $state("guest");
    let id = $state("");

    onMount(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      console.log('Token found');

      try {
        const response = await fetch('http://localhost:3000/users/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const user = await response.json();
        userName = `${user.first_name} ${user.last_name}`;
        userEmail = user.email;
        profilePicture = user.avatar;
        isLoggedIn = true;
        console.log(user.role);
        userRole = user.role;
        id = user.id;

      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }
  });


  let images = $state([
    {
      alt: "image1",
      src: "https://www.dlsu.edu.ph/wp-content/uploads/2022/02/eml-1.jpg",
      title: "comlab2",
    }
  ]);


  let qty: number = 50;
  let vx: number = -0.2;
  let vy: number = -0.3;
  let size: number = 50;
  let staticity: number = 100;
  let divider: boolean = false;
  

</script>

<TempNavbar {userEmail} {userName} {profilePicture} {isLoggedIn} />

{#await getLabData() then labData}
  <div class="relative z-10 px-auto md:px-60">
    <div class="mt-35"></div>

    <div
      class="grid md:grid-cols-2 h-auto w-auto pt-4 bg-tertiary-50/40 backdrop-blur-xs rounded-t-2xl outline-2 outline-secondary-50/60 outline-dashed"
    >
      <div class="flex items-center justify-center flex-col px-2 py-4">
        <Heading tag="h1" class="">{labData.lab_name}</Heading>
        <div
          class="flex justify-center md:justify-start items-center px-5 pt-2"
        >
          Labs <AngleRightOutline class="size-5" />
          {labData.lab_location.building}
          <AngleRightOutline class="size-5" />
          {labData.lab_location.floor} Floor <AngleRightOutline class="size-5" />
          Room {labData.lab_location.room}
        </div>
        <div
          class="flex justify-center md:justify-start text-start items-center px-13 md:px-20 py-5"
        >
          <div
            class="bg-secondary-50/30 px-3 md:px-3 pb-3 pt-2 outline-2 rounded-2xl outline-primary-50/60 outline-dashed text-surface-500"
          >
            {labData.lab_description}
          </div>
        </div>
        <div
          class="flex justify-center md:justify-start items-center px-5 pt-5 w-auto"
        >
          <div
            class="bg-secondary-50/30 md:px-7 pb-3 pt-2 outline-2 rounded-2xl outline-primary-50/60 outline-dashed"
          >
            <DateAvailable labDays={labData.schedule}/>
          </div>
        </div>
      </div>
      <div class="py-5 mx-2 order-first">
        <Carousel {images} duration={5000} class="w-auto" imgClass="rounded-xl">
          <Indicators />
        </Carousel>
      </div>

      <div class=" mt-4"></div>
    </div>
    <div
      class="bg-tertiary-50/40 backdrop-blur-xs rounded-b-2xl p-2 outline-2 outline-secondary-50/60 outline-dashed"
    >
      <div class="bg-primary-200/50 rounded-3xl p-1">
        <Tabs
          tabStyle="none"
          class="flex divide-x divide-gray-200 rounded-lg shadow-sm rtl:divide-x-reverse dark:divide-gray-700"
          contentClass="bg-primary m-0 p-0 px-4 pb-4"
          {divider}
        >
          <TabItem class="w-full" {activeClass} {inactiveClass} open>
            {#snippet titleSlot()}
              <span>Seat Availability</span>
            {/snippet}
            <SeatAvailability />
          </TabItem>

          {#await getLabSeats() then seatdata}
            <TabItem class="w-full" {activeClass} {inactiveClass}>
              {#snippet titleSlot()}
                <span class="">Reservations</span>
              {/snippet}
              {#if userRole == "student"}
                <Reservations seatData={seatdata}/>
              {:else if userRole == "Admin"}
                <ReservationsAdmin seatData={seatdata} />
              {/if}
            </TabItem>
          {/await}
          {#if userRole == "student"}
            <TabItem class="w-full" {activeClass} {inactiveClass}>
              {#snippet titleSlot()}
                <span>Reserve Seat</span>
              {/snippet}
              <ReserveSeat userName={userName} id={id} schedule={labData.schedule} labCode={roomCode}/>
            </TabItem>
          {:else if userRole == "Admin"}
            {#await getStudentData() then students}
            <TabItem class="w-full" {activeClass} {inactiveClass}>
              {#snippet titleSlot()}
                <span>Block Seat for Student</span>
              {/snippet}
              <BlockSeat studentData={students} schedule={labData.schedule} labCode={roomCode}/>
            </TabItem>
            {/await}
            <TabItem class="w-full" {activeClass} {inactiveClass}>
              {#snippet titleSlot()}
                <span>Remove Reservation</span>
              {/snippet}
              <RemoveReservationTable paginationData={labData.reservations} />
            </TabItem>
          {/if}
        </Tabs>
      </div>
    </div>
  </div>

  <div class="-z-10">
    <Particles
      className="absolute z-0 inset-0"
      refresh={true}
      color="#ec8397"
      {staticity}
      quantity={qty}
      {size}
      {vx}
      {vy}
    />
  </div>

  <div class="mt-10"></div>
{/await}
