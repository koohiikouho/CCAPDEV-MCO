<script>

  import './app.css';
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, P } from "flowbite-svelte";
  import Home from './routes/Home.svelte';
  import Lab from './routes/Labs.svelte';
  // import Labs from './routs/Labs.svelte';
  import { slide } from 'svelte/transition';
  import { sineOut } from 'svelte/easing';
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownGroup } from "flowbite-svelte";


  
  const views = [Home, Lab];

  let navbar = null;
  let navbarText =null;

  let viewportComponent = null;
  let currentView = 0;
  let userName = "Kasane Teto";
  let userEmail = "kasaneteto@utau.com"
  function viewHome(){
    currentView = 0;

    navbar.add();
    updateViewportComponent();  
  }

  function viewLabs(){
    currentView = 1;



    navbar.add();
    updateViewportComponent();  
  }

  function updateViewportComponent() {
    viewportComponent = views[currentView];
  }
  updateViewportComponent();
  
  // document.getElementById("homebutton").addEventListener("click", viewHome); 

</script>
<header>
  <div id="navbar" class="text-white w-screen shadow-md">
    <Navbar class="p-0 fixed start-0 top-0 z-20 bg-white/30 hover:bg-surface-50/60 transition backdrop-blur-2xl">
      <NavBrand href="/">
        <img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9 text-surface-400" alt="Lab Club Logo" />
        <span id="navbarText" class="self-center text-xl font-semibold whitespace-nowrap dark:text-white text-surface-400" class:text-white={currentView==1}>Lab Club!</span>
      </NavBrand>
      <NavHamburger />
      <NavUl transitionParams={{ y: -20, duration: 250 }}>
          <NavLi href="#" class="text-surface-400"> <a on:click={viewHome} class:text-white={currentView==1}> Home </a> </NavLi>
          <NavLi href="#" class="text-surface-400"bind:this={navbarText}> <a on:click={viewLabs} class:text-white={currentView==1}> Labs </a></NavLi>
          <NavLi href="#" class="text-surface-400"> <a class:text-white={currentView==1}> Users </a></NavLi>
          <NavLi href="#" class="text-surface-400"> <a class:text-white={currentView==1}> About </a></NavLi>
          <Avatar id="user-drop" src="/images/profile-picture-3.webp" class="cursor-pointer ml-5"/>
          <Dropdown triggeredBy="#user-drop">
            <DropdownHeader>
              <span class="block text-sm">{userName}</span>
              <span class="block truncate text-sm font-medium">{userEmail}</span>
            </DropdownHeader>
            <DropdownGroup>
              <DropdownItem>Profile</DropdownItem>
              <DropdownItem>Reservations</DropdownItem>
              <DropdownItem>Earnings</DropdownItem>
            </DropdownGroup>
            <DropdownGroup>
              <DropdownItem>Sign out</DropdownItem>
            </DropdownGroup>
          </Dropdown>
      </NavUl>
      
    </Navbar>
  </div>
</header>

{#if viewportComponent == views[currentView]}
	<div id="viewport" on:outroend={updateViewportComponent} transition:slide={{ duration: 200, easing: sineOut}}>
		<svelte:component this={viewportComponent}></svelte:component>
	</div>
{/if}
