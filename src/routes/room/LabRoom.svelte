<script>
  import "../../app.css";
  import {
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    P,
    ControlButton,
    Controls,
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

  // document.getElementById("homebutton").addEventListener("click", viewHome);

  let params = new URLSearchParams(location.search);
  let roomCode = params.get("labCode");
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
      <NavUl transitionParams={{ y: -20, duration: 250 }}>
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

<div class="mt-35"></div>

<div class="grid grid-flow-row h-auto divide-y-2">
  <div class="flex content-start mx-auto md:mx-60 pb-10 items-end">
    <h1 class="pr-5">GK210 Computer Lab</h1>
    <cite>Gokongwei 2nd Floor Room 10</cite>
  </div>

  <div class="mx-60 py-10">
    <Carousel {images} duration={5000} class="">
      <Controls />
      <Indicators />
    </Carousel>
  </div>

  <div></div>
</div>
