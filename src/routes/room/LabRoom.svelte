<script>
  import '../../app.css';
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, P } from "flowbite-svelte";
  // import Labs from './routs/Labs.svelte';
  import { slide } from 'svelte/transition';
  import { expoIn } from 'svelte/easing';
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownGroup } from "flowbite-svelte";


  let profilePic = "src/assets/profilepic.jpg";

  const views = [];

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


  let params = new URLSearchParams(location.search);
  let roomCode = params.get('labCode');


</script>
<header>
  <div id="navbar" class="text-white w-screen shadow-md">
    <Navbar class="p-0 fixed start-0 top-0 z-20 bg-white/30 hover:bg-surface-50/60 transition backdrop-blur-xl">
      <NavBrand href="../../../">
        <img src="/src/assets/logolite.png" class="me-3 h-6 sm:h-9 text-surface-400 object-fill" alt="Lab Club Logo" on:click={viewHome}/>
        <span id="navbarText" class="self-center text-xl font-semibold whitespace-nowrap dark:text-white text-surface-400" on:click={viewHome}>Lab Club!</span>
      </NavBrand>
      <NavHamburger />
      <NavUl transitionParams={{ y: -20, duration: 250 }}>
          <NavLi href="#" class="text-surface-400"bind:this={navbarText}> <a on:click={viewLabs}>Labs</a></NavLi>
          <NavLi href="#" class="text-surface-400">Users</NavLi>
          <NavLi href="#" class="text-surface-400">About</NavLi>
          <Avatar id="user-drop" src={profilePic} class="cursor-pointer ml-5"/>
          <Dropdown triggeredBy="#user-drop" class="mt-5 bg-primary-200" >
            <DropdownHeader>
              <span class="block text-sm text-white">{userName}</span>
              <span class="block truncate text-sm font-medium text-white">{userEmail}</span>
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
<div class="mt-100">
    Hello {roomCode}
</div>

