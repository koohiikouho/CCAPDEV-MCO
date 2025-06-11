<script>

  import './app.css';
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, P } from "flowbite-svelte";
  import Home from './routes/Home.svelte';
  // import Labs from './routs/Labs.svelte';
  import { slide } from "svelte/transition";
  const views = [Home];

  let viewportComponent = null;
  let currentView = 0;

  function viewHome(){
    currentView = 0;
    event.preventDefault();
    updateViewportComponent();  
  }

  function viewLabs(){
    currentView = 1;
    updateViewportComponent();  
  }

  function updateViewportComponent() {
    viewportComponent = views[currentView];
  }
  updateViewportComponent();
  
  // document.getElementById("homebutton").addEventListener("click", viewHome); 

</script>
<header>
  <div class="text-white w-screen shadow-md hover-transparency">
    <Navbar class="p-0 fixed start-0 top-0 z-20 bg-primary-400/80">
      <NavBrand href="/">
        <img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Lab Club Logo" />
        <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Lab Club!</span>
      </NavBrand>
      <NavHamburger />
      <NavUl transition={slide} transitionParams={{ y: -20, duration: 250 }}>
          <NavLi href="#" class="text-white"> <a on:click={viewHome}> Home </a> </NavLi>
          <NavLi href="#" class="text-white"> <a on:click={viewLabs}> Labs </a></NavLi>
          <NavLi href="/docs/components/navbar" class="text-white">About</NavLi>
          <NavLi href="/pricing" class="text-white">Placeholder</NavLi>
          <NavLi href="/contact" class="text-white">Placeholder</NavLi>
      </NavUl>
    </Navbar>
  </div>
</header>

{#if viewportComponent == views[currentView]}
	<div id="viewport" on:outroend={updateViewportComponent} transition:slide>
		<svelte:component this={viewportComponent}></svelte:component>
	</div>
{/if}
