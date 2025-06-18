<script lang="ts">
  import './app.css';
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, P, Footer, FooterCopyright } from "flowbite-svelte";
  import Home from './routes/Home.svelte';
  import Lab from './routes/Labs.svelte';
  import Users from './routes/Users.svelte';
  // import Labs from './routs/Labs.svelte';
  import Reservations from './routes/Reservations.svelte';
  import Profile from './routes/profiles/Profile.svelte';
  import { fade } from 'svelte/transition';
  import { expoIn } from 'svelte/easing';
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownGroup } from "flowbite-svelte";
  import Suggestions from './routes/Suggestions.svelte';

  const views = [Home, Lab, Users, Reservations, Profile, Suggestions];

  let params = new URLSearchParams(location.search);
  let viewNumber = Number(params.get("view"));

  let navbar = null;

  let viewportComponent = null;
  let currentView = 0;
  let userName = "Kasane Teto";
  let userEmail = "kasaneteto@dlsu.edu.ph"
  let profilePicture = "/src/assets/profilepic.jpg";

  function changeViewOnLoad(){
    if (viewNumber == 0){

    }
    else{
      currentView = viewNumber;
    }
  }

  function viewHome(){
    currentView = 0;
    scrollTo(0, 0);
    navbar.add();
    updateViewportComponent();  
  }

  function viewLabs(){
    currentView = 1;
    navbar.add();
    updateViewportComponent();  
  }

  function viewUsers() {
    currentView = 2;
    navbar.add();
    updateViewportComponent();
  }

  function viewReservations() {
    currentView = 3;
    navbar.add();
    updateViewportComponent();
  }

    function viewProfile() {
    currentView = 4;
    navbar.add();
    updateViewportComponent();
  }

  function updateViewportComponent() {
    viewportComponent = views[currentView];
  }

  changeViewOnLoad()

  updateViewportComponent();
  
  let isTech : number = 1;


  let isLoggedIn: boolean = true;
  // isLoggedIn = Boolean(params.get("signedIn"));

  function signOut(){
    isLoggedIn = false;
    userName = "Guest";
    userEmail = "Sign in to reserve";
    profilePicture= "https://i.pinimg.com/236x/08/35/0c/08350cafa4fabb8a6a1be2d9f18f2d88.jpg";
  }
  
  function viewSuggestions(){
    currentView = 5;
    scrollTo(0, 0);
    navbar.add();
    updateViewportComponent();  
  }
  // if(isLoggedIn == false)
  //    signOut();

</script>

<header>
  <div id="navbar" class="text-white w-screen shadow-md">
    <Navbar class="p-0 fixed start-0 top-0 z-20 bg-white/30 hover:bg-white/60 transition backdrop-blur-xl">
      <NavBrand href="#a" onclick={viewHome}>
        <img src="/src/assets/logolite.png" class="me-3 h-6 sm:h-9 text-surface-400 object-fill" alt="Lab Club Logo" />
        <span id="navbarText" class="self-center text-xl font-semibold whitespace-nowrap dark:text-white text-surface-400">Lab Club!</span>
      </NavBrand>
      <NavHamburger class="bg-surface-400 hover:bg-surface-600"/>
      <NavUl ulClass="items-center align-middle p-1">
          <NavLi href="#a" class="text-surface-400" onclick={viewLabs}>Labs</NavLi>
          <NavLi href="#a" class="text-surface-400" onclick={viewUsers}>Users</NavLi>
          <NavLi href="#a" class="text-surface-400" onclick={viewSuggestions}>Suggestions</NavLi>
          <NavLi class="flex align-center">
            <Avatar id="user-drop" src={profilePicture} class="cursor-pointer"/>
            <Dropdown triggeredBy="#user-drop" class="mt-5 bg-primary-300/70" >
              <DropdownHeader>
                <span class="block text-sm text-white">{userName}</span>
                <span class="block truncate text-sm font-medium text-white">{userEmail}</span>
              </DropdownHeader>
              <DropdownGroup class="text-white ">
                <DropdownItem class="hover:text-surface-400 text-center w-full fixcursor" onclick={viewProfile}>Profile</DropdownItem>
                <DropdownItem class="hover:text-surface-400 text-center w-full fixcursor" onclick={viewReservations}>Reservations</DropdownItem>
              </DropdownGroup>
              <DropdownGroup class="text-white">

              {#if isLoggedIn}
                <DropdownItem class="hover:text-surface-400 text-center w-full cursor-pointer" onclick={signOut}>Sign out</DropdownItem>
              {:else}
                <DropdownItem class="hover:text-surface-400 text-center w-full cursor-pointer" href='/src/routes/login/login.html'>Login</DropdownItem>
              {/if}
              </DropdownGroup>
            </Dropdown>
          </NavLi>
      </NavUl>
    </Navbar>
  </div>
</header>

{#if viewportComponent == views[currentView]}
	<div id="viewport" onoutroend={updateViewportComponent} transition:fade={{ duration: 200, easing: expoIn}}>
	  <svelte:component this={viewportComponent}></svelte:component>
	</div>
{/if}

<Footer class="bg-primary-300/20 text-center">
  <FooterCopyright href="/" by="Made with ❤️ by Group 1" copyrightMessage=""/>
</Footer>