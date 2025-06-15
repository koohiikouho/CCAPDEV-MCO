<script lang="ts">
  import UserCard from "../lib/components/UserCard.svelte";
  import Particles from "../lib/components/Particles.svelte";
  import Searchbar from "../lib/components/Search.svelte";
  import { flip } from "svelte/animate";

  const users = [
    {
      id: 1,
      name: "Ron Alonzo",
      email: "ron_alonzo@dlsu.edu.ph",
      avatar: "src/assets/profilepic.jpg",
    },
    {
      id: 2,
      name: "Joshua Gonzales",
      email: "joshua_gonzales@dlsu.edu.ph",
      avatar: "",
    },
    {
      id: 3,
      name: "Nathaniel Reyes",
      email: "nathaniel_reyes@dlsu.edu.ph",
      avatar: "src/assets/Users/alden.jpeg",
    },
    {
      id: 4,
      name: "Cochise King",
      email: "cochise_king@dlsu.edu.ph",
      avatar: "",
    },
  ];

  let qty: number = 10;
  let vx: number = 0.1;
  let vy: number = 0.2;
  let size: number = 100;
  let staticity: number = 100;
  let searchTerm = "";
</script>

<div class="fixed inset-0 -z-10">
  <Particles 
    className="absolute inset-0" 
    refresh={true} 
    color="#ec8397" 
    staticity={staticity} 
    quantity={qty}
    size={size} 
    vx={vx} 
    vy={vy}
  />
</div>

<div class="flex flex-row min-h-screen justify-center items-center bg-offwhite">
  <div class="h-auto w-screen max-w-4xl bg-opacity-0 z-10 p-4">
    
    <div class="py-10 bg-tertiary-50/50 backdrop-blur-sm rounded-md border-2 border-dashed border-secondary-50/60">
      <h1 class="text-surface-500 text-center text-2xl font-bold mb-4">Users</h1>

      <!-- Search Bar -->
      <div class="flex justify-center mb-6 px-4">
        <div class="max-w-md w-full">
          <Searchbar/>
        </div>
      </div>

      
      <div class="flex justify-center pt-6 gap-4 flex-wrap px-4">
        {#each users as user (user.id)}
          <div animate:flip={{ duration: 300 }}>
            <UserCard
              name={user.name}
              email={user.email}
              avatar={user.avatar}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>