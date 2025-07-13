<script lang="ts">
    import SignUpComp from "../../lib/components/SignUpComp.svelte";
    import {
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Avatar,
    Dropdown,
    DropdownHeader,
    DropdownItem,
    DropdownGroup,
    Carousel, 
    Indicators
  } from "flowbite-svelte";
  import TempNavbar from "../../lib/components/TempNavbar.svelte";
  import Particles from "../../lib/components/Particles.svelte";

  const views = [];

  let navbar = null;
  let navbarText = null;

  

  let viewportComponent = null;
  let currentView = 0;


  function updateViewportComponent() {
    viewportComponent = views[currentView];
  }
  updateViewportComponent();

  let qty: number = 35;
  let vx: number = -1;
  let vy: number = 1;
  let size: number = 50;
  let staticity: number = 20;
  let color: string = "#bad6e9"; 

</script>

<div class="-z-10">
  <Particles className="absolute inset-0" refresh={true} color={color} staticity={staticity} quantity={qty}
  size={size} vx={vx} vy={vy}/>
</div>

<TempNavbar isLoggedIn={false} />

<SignUpComp/>