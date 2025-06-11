<script>
  import './app.css';
  import './lib/components/BackgroundBoxesExample.svelte'
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, P } from "flowbite-svelte";
  import Lights from './lib/components/Lights.svelte';
  
</script>
<header>
  
  <div class="bg-primary-400/80 text-white w-screen shadow-md">
    <Navbar class="p-0">
      <NavBrand href="/">
        <img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Lab Club Logo" />
        <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Lab Club!</span>
      </NavBrand>
      <NavHamburger />
      <NavUl >
          <NavLi href="/" class="text-white">Home</NavLi>
          <NavLi href="/about" class="text-white">Labs</NavLi>
          <NavLi href="/docs/components/navbar" class="text-white">About</NavLi>
          <NavLi href="/pricing" class="text-white">Placeholder</NavLi>
          <NavLi href="/contact" class="text-white">Placeholder</NavLi>
      </NavUl>
    </Navbar>
  </div>
 
</header>



    <br>
    <br>
<div>
 <P>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequuntur quos impedit quo, quis quam in distinctio deleniti facere! Ea aliquid maiores iusto obcaecati rerum quisquam repellendus dignissimos rem quo veritatis.</P>

<P>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequuntur quos impedit quo, quis quam in distinctio deleniti facere! Ea aliquid maiores iusto obcaecati rerum quisquam repellendus dignissimos rem quo veritatis.</P>
</div>

<Lights/>

