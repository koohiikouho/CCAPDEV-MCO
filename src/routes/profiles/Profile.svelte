<script lang="ts">
  import {
    Avatar, Badge, Card
  } from "flowbite-svelte";
  import {
    CalendarMonthOutline, ClockOutline, UsersOutline,
    FlaskOutline, ComputerSpeakerOutline
  } from "flowbite-svelte-icons";
  import TempNavbar from "../../lib/components/TempNavbar.svelte";
  import { getUserData, getLabReservations } from "../../../api/api.js";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let params = new URLSearchParams(location.search);
  let userCode = params.get("userCode");

  // 🔐 Store the logged-in user separately for the navbar
  let loggedInUser = null;

  // The user profile being viewed
  let users = [];
  let currentUser = null;

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

  let reservations = [];

  onMount(async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const res = await fetch("http://localhost:3000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const me = await res.json();
          loggedInUser = {
            name: `${me.first_name} ${me.last_name}`,
            email: me.email,
            avatar: me.avatar || "/src/assets/default_avatar.png"
          };
        } else {
          console.error("Failed to fetch logged-in user");
        }
      } catch (e) {
        console.error("Error loading logged-in user:", e);
      }
    }

    try {
      const data = await getUserData();
      users = data.map((user) => ({
        _id: user._id,
        name: `${user?.name?.first_name || "Unnamed"} ${user?.name?.last_name || ""}`,
        email: user?.email || "noemail@domain.com",
        avatar: user?.avatar || "/src/assets/default_avatar.png",
        role: user?.role || "Unknown",
        bio: user?.bio || "No description provided.",
      }));
      currentUser = users.find(u => u._id === userCode);

      const reservationData = await getLabReservations();
      if (currentUser) {
        reservations = reservationData
          .filter(r => String(r.user_id?._id || r.user_id) === String(currentUser._id))
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
            status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "Unknown",
          }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  });
</script>

<TempNavbar
  userName={loggedInUser?.name || "Guest"}
  userEmail={loggedInUser?.email || "Sign in to reserve"}
  profilePicture={getAvatar(loggedInUser?.avatar)}
/>

{#if currentUser}
<main class="mt-10 p-10 sm:p-20 bg-primary-50 min-h-screen text-surface-800">
  <div class="grid grid-cols-1 gap-10 max-w-6xl mx-auto bg-white p-10 rounded-xl shadow-2xl">
    <div class="grid md:grid-cols-3 gap-10">
      <div class="flex flex-col items-center">
        <Avatar
          src={getAvatar(currentUser.avatar)}
          class="w-70 h-70 rounded-full ring-4 ring-primary-500 shadow-lg object-cover"
        />
      </div>
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

    <hr class="my-4 border-t border-gray-300" />

    <div>
      <h2 class="text-2xl font-bold text-primary-900 mb-4">Lab Reservations</h2>
      {#if reservations.length > 0}
        <div class="grid gap-6">
          {#each reservations as reservation, index}
            <div in:fly|global={{ y: 50, duration: 1 + index * 100, delay: 300, easing: cubicOut }}>
              <Card class="max-w-full border border-surface-200 shadow-md p-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div class="flex items-center gap-3 mb-2 sm:mb-0">
                    <FlaskOutline class="w-6 h-6 text-primary-600" />
                    <h3 class="text-xl font-semibold text-surface-800">{reservation.labName}</h3>
                  </div>
                  <Badge color={getStatusColor(reservation.status)} class="w-fit">
                    {reservation.status}
                  </Badge>
                </div>
                <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                  <div class="flex items-center gap-2">
                    <CalendarMonthOutline class="w-4 h-4 text-surface-400" />
                    <span class="text-sm text-surface-600">{reservation.date}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <ClockOutline class="w-4 h-4 text-surface-400" />
                    <span class="text-sm text-surface-600">{reservation.time}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UsersOutline class="w-4 h-4 text-surface-400" />
                    <span class="text-sm text-surface-600">{reservation.duration}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <ComputerSpeakerOutline class="w-4 h-4 text-surface-400" />
                    <span class="text-sm text-surface-600">{reservation.seat}</span>
                  </div>
                </div>
              </Card>
            </div>
          {/each}
        </div>
      {:else}
        <Card class="text-center py-12 border border-surface-200 bg-surface-50 mt-10 mx-auto">
          <FlaskOutline class="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-surface-700 mb-2">No Reservations Found</h3>
          <p class="text-surface-500">This user hasn't made any lab reservations yet.</p>
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
