<script lang="ts">
    import LoginInt from "../../lib/components/LoginInt.svelte";
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

  let profilePic =
    "/src/assets/users/alden.jpeg";

  const views = [];

  let navbar = null;
  let navbarText = null;

  

  let viewportComponent = null;
  let currentView = 0;
  let userName = "Kasane Teto";
  let userEmail = "kasaneteto@utau.com";


  function updateViewportComponent() {
    viewportComponent = views[currentView];
  }
  updateViewportComponent();

</script>

<TempNavbar/>

<LoginInt />