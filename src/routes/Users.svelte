<script lang="ts">
  import { onMount } from "svelte";
  import UserCard from "../lib/components/UserCard.svelte";
  import Particles from "../lib/components/Particles.svelte";
  import { getUserData } from '../../api/api.js';
  import { Input } from "flowbite-svelte";
  import { SearchOutline, UserCircleOutline } from "flowbite-svelte-icons";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  let users = [];
  let value = "";
  let filteredItems = [];

  let qty: number = 35;
  let vx: number = -1;
  let vy: number = 1;
  let size: number = 50;
  let staticity: number = 20;
  let color: string = "#bad6e9";

  onMount(async () => {
    try {
      const data = await getUserData();
      users = data.map((user, index) => ({
        id: index + 1,
        name: `${user.name.first_name} ${user.name.last_name}`,
        email: user.email,
        avatar: user.avatar || "/src/assets/default_avatar.png",
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1)
      }));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  });

  // Reactive filter
  $: if (users.length) {
    filteredItems = users.filter(user =>
      user.name.toLowerCase().includes(value.toLowerCase())
    );
  }
</script>

<div class="-z-10">
  <Particles className="absolute inset-0" refresh={true} color={color} staticity={staticity} quantity={qty}
  size={size} vx={vx} vy={vy}/>
</div>

<div class="flex flex-row min-h-screen justify-center items-center bg-offwhite">
  <div class="h-auto w-screen md:w-300 bg-opacity-0 z-10">
    <div class="py-10 bg-tertiary-50/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-secondary-50/60">
      <h1 class="text-surface-600 font-bold md:text-start text-center pl-auto md:pl-9 flex flex-col md:flex-row items-center justify-center md:justify-between gap-5">
        <div class="flex items-end">
          <UserCircleOutline class="w-15 h-15 mr-5"/>Users 
        </div> 
        <Input id="default-input" placeholder="Search Users" class="pl-8 h-12" divClass="px-9 w-100" bind:value>
          {#snippet left()}
            <SearchOutline class="h-5 w-5 ml-8 text-gray-500 dark:text-gray-400" />
          {/snippet}
        </Input>
      </h1>

      <div class="flex justify-center pt-6 gap-4 flex-wrap px-4">
        {#each filteredItems as user, index}
          <div in:fly|global={{ y: 50, duration: index * 100, delay: 100, easing: cubicOut }}>
            <UserCard
              name={user.name}
              email={user.email}
              avatar={user.avatar}
              role={user.role}
              usercode={user.id}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
