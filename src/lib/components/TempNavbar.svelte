<script lang="ts">
  import { Avatar, Dropdown, DropdownGroup, DropdownHeader, DropdownItem, Navbar, NavBrand, NavHamburger, NavLi, NavUl } from "flowbite-svelte";

    let {userName = "guest", userEmail = "", profilePicture = "https://i.pinimg.com/236x/08/35/0c/08350cafa4fabb8a6a1be2d9f18f2d88.jpg"} = $props();
</script>



<header>
    <div id="navbar" class="text-white w-screen shadow-md">
      <Navbar class="p-0 fixed start-0 top-0 z-20 bg-white/30 hover:bg-white/60 transition backdrop-blur-xl">
        <NavBrand href="/">
          <img src="/src/assets/logolite.png" class="me-3 h-6 sm:h-9 text-surface-400 object-fill" alt="Lab Club Logo" />
          <span id="navbarText" class="self-center text-xl font-semibold whitespace-nowrap dark:text-white text-surface-400">Lab Club!</span>
        </NavBrand>
        <NavHamburger class="bg-surface-400 hover:bg-surface-600"/>
        <NavUl ulClass="items-center align-middle p-1">
            <NavLi href="../../../index.html?view=1" class="text-surface-400">Labs</NavLi>
            <NavLi href="../../../index.html?view=2"class="text-surface-400" >Users</NavLi>
            <NavLi href="#a" class="text-surface-400">About</NavLi>
            <NavLi class="flex align-center">
              <Avatar id="user-drop" src={profilePicture} class="cursor-pointer"/>
              <Dropdown triggeredBy="#user-drop" class="mt-5 bg-primary-300/70" >
                <DropdownHeader>
                  <span class="block text-sm text-white">{userName}</span>
                  <span class="block truncate text-sm font-medium text-white">{userEmail}</span>
                </DropdownHeader>
                <DropdownGroup class="text-white ">
                  <DropdownItem class="hover:text-surface-400">Profile</DropdownItem>
                  <DropdownItem class="hover:text-surface-400 text-center w-full fixcursor" href="../../../index.html?view=3">Reservations</DropdownItem>
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
  </header>
  