<script>

  import './app.css';
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, P } from "flowbite-svelte";
  import Home from './routes/Home.svelte';
  import Lab from './routes/Labs.svelte';
  // import Labs from './routs/Labs.svelte';
  import { slide } from "svelte/transition";
  const views = [Home, Lab];

  let navbar = null;
  let navbarText =null;

  let viewportComponent = null;
  let currentView = 0;

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
    <Navbar class="p-0 fixed start-0 top-0 z-20 bg-white/0 hover:bg-surface-50/60 transition">
      <NavBrand href="/">
        <img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9 text-surface-400" alt="Lab Club Logo" />
        <span id="navbarText" class="self-center text-xl font-semibold whitespace-nowrap dark:text-white text-surface-400" class:text-white={currentView==1}>Lab Club!</span>
      </NavBrand>
      <NavHamburger />
      <NavUl transition={slide} transitionParams={{ y: -20, duration: 250 }}>
          <NavLi href="#" class="text-surface-400"> <a on:click={viewHome} class:text-white={currentView==1}> Home </a> </NavLi>
          <NavLi href="#" class="text-surface-400"bind:this={navbarText}> <a on:click={viewLabs} class:text-white={currentView==1}> Labs </a></NavLi>
          <NavLi href="/docs/components/navbar" class="text-surface-400"> <a class:text-white={currentView==1}> About </a></NavLi>
          <NavLi href="/pricing" class="text-surface-400">Placeholder</NavLi>
          <NavLi href="/contact" class="text-surface-400">Placeholder</NavLi>
      </NavUl>
    </Navbar>
  </div>
</header>

{#if viewportComponent == views[currentView]}
	<div id="viewport" on:outroend={updateViewportComponent} transition:slide>
		<svelte:component this={viewportComponent}></svelte:component>
	</div>
{/if}
