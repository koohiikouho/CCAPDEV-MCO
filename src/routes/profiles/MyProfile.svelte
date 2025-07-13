<script lang="ts">
  import {
    Avatar, Button, Modal, Input, Label, Badge, Card
  } from "flowbite-svelte";
  import {
    CalendarMonthOutline, ClockOutline, UsersOutline,
    FlaskOutline, ComputerSpeakerOutline
  } from "flowbite-svelte-icons";
  import TempNavbar from "../../lib/components/TempNavbar.svelte";
  import { getUserData, getLabReservations, getLabData } from "../../../api/api.js";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let constUser = {
    name: "Kasane Teto",
    email: "kasaneteto@dlsu.edu.ph",
    avatar: "/src/assets/profilepic.jpg",
    role: "Lab Assistant",
    bio:
      "I'm passionate about technology and creative research. I assist with lab experiments, manage reservations, and support members in the lab.",
  };

  let showEditModal = false;

  function openEditModal() {
    showEditModal = true;
  }

  function saveProfile() {
    console.log("Updated Profile:", currentUser);
    showEditModal = false;
  }

  function getAvatar(avatar: string): string {
    return avatar && avatar !== "" ? avatar : "/src/assets/default_avatar.png";
  }

  function getStatusColor(status) {
    switch (status) {
      case "Confirmed": return "green";
      case "Ongoing": return "yellow";
      case "Completed": return "blue";
      case "Cancelled": return "red";
      default: return "gray";
    }
  }

  function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

let isOwnProfile = true;
let currentUser = null;
let reservations = [];

onMount(async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error("No access token found");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/users/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const user = await response.json();
    currentUser = {
      _id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio
    };

    // Fetch all reservations
    const reservationsResp = await fetch("http://localhost:3000/reservations");
    const allReservations = await reservationsResp.json();

    reservations = allReservations
      .filter(r => String(r.user_id?._id || r.user_id) === currentUser._id)
      .map((r, index) => ({
        labName: r.lab_id?.lab_name || "Unknown Lab",
        date: new Date(r.time_in).toLocaleDateString(),
        time: new Date(r.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration:
          r.time_in && r.time_out &&
          new Date(r.time_out).getTime() > new Date(r.time_in).getTime()
            ? formatDuration(new Date(r.time_out).getTime() - new Date(r.time_in).getTime())
            : "Invalid time",
        seat: r.seat || "N/A",
        status: r.status
          ? r.status.charAt(0).toUpperCase() + r.status.slice(1)
          : "Unknown",
      }));

  } catch (error) {
    console.error("Error loading profile:", error);
  }
});

</script>


<TempNavbar
  userName={currentUser?.name || "Loading..."}
  userEmail={currentUser?.email || "Loading..."}
  profilePicture={getAvatar(currentUser?.avatar)}
/>

{#if currentUser}
<main class="mt-10 p-10 sm:p-20 bg-primary-50 min-h-screen text-surface-800">
  <div
    class="grid grid-cols-1 gap-10 max-w-6xl mx-auto bg-white p-10 rounded-xl shadow-2xl"
  >
    <!-- Profile Section -->
    <div class="grid md:grid-cols-3 gap-10">
      <!-- Avatar -->
      <div class="flex flex-col items-center">
        <Avatar
          src={getAvatar(currentUser.avatar)}
          class="w-70 h-70 rounded-full ring-4 ring-primary-500 shadow-lg object-cover"
        />
      </div>

      <!-- Info -->
      <div class="md:col-span-2 space-y-4">
        <h1 class="text-4xl font-bold text-primary-900">{currentUser.name}</h1>
        <p class="text-lg text-primary-700">{currentUser.email}</p>
        <Badge class="text-sm px-3 py-1">{currentUser.role}</Badge>

        <div class="mt-6">
          <h2 class="text-xl font-semibold text-surface-700 mb-2">About</h2>
          <p class="text-surface-600">{currentUser.bio}</p>
        </div>
      </div>
    </div>

    {#if isOwnProfile}
      <div class="flex gap-2 ml-27">
        <Button color="primary" onclick={openEditModal}>Edit Profile</Button>
      </div>
    {/if}

    <hr class="my-4 border-t border-gray-300" />

    <div>
      <h2 class="text-2xl font-bold text-primary-900 mb-4">Lab Reservations</h2>

      {#if reservations.length > 0}
        <div class="grid gap-6">
          {#each reservations as reservation,index}
          <div in:fly|global={{ y: 50, duration: 1+index*100, delay: 300, easing: cubicOut }}>
            <Card class="max-w-full border border-surface-200 shadow-md p-6">
              <div
                class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4"
              >
                <div class="flex items-center gap-3 mb-2 sm:mb-0">
                  <FlaskOutline class="w-6 h-6 text-primary-600" />
                  <h3 class="text-xl font-semibold text-surface-800">
                    {reservation.labName}
                  </h3>
                </div>
                <Badge color={getStatusColor(reservation.status)} class="w-fit">
                  {reservation.status}
                </Badge>
              </div>

              <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                <div class="flex items-center gap-2">
                  <CalendarMonthOutline class="w-4 h-4 text-surface-400" />
                  <span class="text-sm text-surface-600"
                    >{reservation.date}</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <ClockOutline class="w-4 h-4 text-surface-400" />
                  <span class="text-sm text-surface-600"
                    >{reservation.time}</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <UsersOutline class="w-4 h-4 text-surface-400" />
                  <span class="text-sm text-surface-600"
                    >{reservation.duration}</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <ComputerSpeakerOutline class="w-4 h-4 text-surface-400" />
                  <span class="text-sm text-surface-600"
                    >{reservation.seat}</span
                  >
                </div>
              </div>
            </Card>
          </div>
          {/each}
        </div>
      {:else}
          <Card
            class="text-center py-12 border border-surface-200 bg-surface-50 mt-10 mx-auto"
          >
          <FlaskOutline class="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-surface-700 mb-2">
            No Reservations Found
          </h3>
          <p class="text-surface-500">
            This user hasn't made any lab reservations yet.
          </p>
        </Card>
      {/if}
    </div>
  </div>
</main>

{:else}
  <main class="min-h-screen flex items-center justify-center bg-primary-50">
    <p class="text-lg text-gray-500">Loading profile...</p>
  </main>
{/if}

<Modal
  open={showEditModal}
  onclose={() => (showEditModal = false)}
  class="z-50"
>
  <div class="p-6 space-y-6">
    <h3 class="text-xl font-medium text-surface-800">Edit Profile</h3>
    <div class="space-y-4">
      <div>
        <Label for="name" class="block mb-1">Name</Label>
        <Input id="name" type="text" bind:value={currentUser.name} />
      </div>

      <div>
        <Label for="email" class="block mb-1">Email</Label>
        <Input id="email" type="email" bind:value={currentUser.email} disabled />
      </div>


      <div>
        <Label for="bio" class="block mb-1">Description</Label>
        <textarea
          id="bio"
          rows="3"
          bind:value={currentUser.bio}
          class="w-full rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
        ></textarea>
      </div>

      <div class="flex flex-col items-center space-y-3">
        <Label for="avatar" class="block mb-1">Profile Picture</Label>

        <Input
          id="avatar"
          type="file"
          accept="image/*"
          class="block mb-1 pl-8"
          onchange={(e) => {
            const input = e.target as HTMLInputElement;
            const file = input?.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                currentUser.avatar = event.target?.result as string;
              };
              reader.readAsDataURL(file);
            }
          }}
        />

        <p class="text-sm text-gray-500 mt-1">Preview:</p>
        <img
          src={currentUser.avatar}
          alt="Preview"
          class="mt-2 w-24 h-24 rounded-full border-2 border-primary-500 object-cover"
        />
      </div>
    </div>

    <div class="flex-row-reverse flex justify-between">
      <div class="flex justify-end gap-2 pt-4">
        <Button color="gray" onclick={() => (showEditModal = false)}
          >Cancel</Button
        >
        <Button color="primary" onclick={saveProfile}>Save</Button>
      </div>
      <div class="flex justify-start gap-2 pt-4">
        <Button color="red" onclick={saveProfile}>Delete Profile</Button>
      </div>
    </div>
  </div>
</Modal>
