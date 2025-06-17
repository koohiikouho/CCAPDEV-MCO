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
      role: "Student"
    },
    {
      id: 2,
      name: "Joshua Gonzales",
      email: "joshua_gonzales@dlsu.edu.ph",
      avatar: "",
      role: "Student"
    },
    {
      id: 3,
      name: "Nathaniel Reyes",
      email: "nathaniel_reyes@dlsu.edu.ph",
      avatar: "src/assets/Users/alden.jpeg",
      role: "Student"
    },
    {
      id: 4,
      name: "Cochise King",
      email: "cochise_king@dlsu.edu.ph",
      avatar: "",
      role: "Student"
    },
    {
      id: 5,
      name: "Kasane Teto",
      email: "kasaneteto@utau.com",
      avatar: "src/assets/profilepic.jpg",
      role: "Lab Technician"
    }
  ];

  let qty: number = 35;
  let vx: number = -1;
  let vy: number = 1;
  let size: number = 50;
  let staticity: number = 20;
  let color: string = "#bad6e9";  
  let searchTerm = "";
</script>

<div class="-z-10">
  <Particles className="absolute inset-0" refresh={true} color={color} staticity={staticity} quantity={qty}
  size={size} vx={vx} vy={vy}/>
</div>

<div class="flex flex-row min-h-screen justify-center items-center bg-offwhite">
  <div class="h-auto w-screen md:w-300 bg-opacity-0 z-10">
    
    <div class="py-10 bg-tertiary-50/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-secondary-50/60">
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
              role={user.role}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

