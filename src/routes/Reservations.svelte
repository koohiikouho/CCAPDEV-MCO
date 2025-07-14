<script lang="ts">
  import { Card, Button, Badge, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
  // Using correct flowbite-svelte-icons imports
  import { CalendarMonthOutline, ClockOutline, UsersOutline, FlaskOutline, ComputerSpeakerOutline } from "flowbite-svelte-icons";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  let currentUser = null;
  let reservations = [];
  
  let showDeleteModal = false;
  let selectedReservationId = null;
  let successMessage = "";

  let editing = null; 
  let editDate = "";
  let editStart = "";
  let editHours = 1;
  let editSeats = "";

  function mapToCard(r) {
    return {
      id: r._id,
      labName: r.lab_id?.lab_name || "Unknown Lab",
      date: new Date(r.time_in).toLocaleDateString(),
      time: new Date(r.time_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      duration: formatDuration(new Date(r.time_out).getTime() - new Date(r.time_in).getTime()),
      seat: r.seat || "N/A",
      status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
      createdOn: new Date(r.createdAt).toLocaleString(),
    };
  }

  async function saveEdit() {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const payload = {
      date: editDate,
      time_start: editStart,
      hours: editHours,
      seats: editSeats.split(",").map(s => s.trim()).filter(Boolean)
    };

    const res  = await fetch(`http://localhost:3000/reservations/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const { reservation } = await res.json();
      reservations = reservations.map(r => r.id === reservation._id
        ? { ...r, ...mapToCard(reservation) }
        : r);
      successMessage = "Reservation updated.";
      editing = null;
    } else {
      const err = await res.json();
      alert(err.error || "Update failed");
    }
  }


  function confirmCancel(id: string) {
    selectedReservationId = id;
    showDeleteModal = true;
  }

  function getStatusColor(status) {
    switch(status) {
      case 'Confirmed': return 'green';
      case 'Ongoing': return 'yellow';
      case 'Completed': return 'blue';
      case 'Cancelled': return 'red';
      default: return 'gray';
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

  function editReservation(id: string) {
    const r = reservations.find(res => res.id === id);
    if (!r) return;

    editing = r;

    const start = new Date(r.rawStart);
    const end   = new Date(r.rawEnd);

    const pad = (n: number) => n.toString().padStart(2, "0");

    editDate  = start.toISOString().slice(0, 10);
    editStart = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const halfHours = Math.round((end.getTime() - start.getTime()) / 1_800_000);
    editHours = halfHours * 0.5;
    editSeats = r.rawSeats.join(", ");
  }

  async function deleteReservation() {
    if (!selectedReservationId) return;

    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

    try {
      const response = await fetch(`http://localhost:3000/reservations/${selectedReservationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        reservations = reservations.map(res =>
          res.id === selectedReservationId ? { ...res, status: 'Cancelled' } : res
        );
        successMessage = "Reservation cancelled successfully.";
      } else {
        console.error("Delete failed:", result.error || result.message);
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
    } finally {
      showDeleteModal = false;
      selectedReservationId = null;
    }
  }

  onMount(async () => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem('accessToken');
    if (!token) return console.error("No access token found");

    try {
      const resUser = await fetch("http://localhost:3000/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resUser.ok) throw new Error("Failed to fetch user data");

      const user = await resUser.json();
      currentUser = {
        _id: user.id,
      };

      const resReservations = await fetch("http://localhost:3000/reservations");
      const all = await resReservations.json();

      reservations = all
        .filter(r => String(r.user_id?._id || r.user_id) === currentUser._id)
        .map(r => ({
          id: r._id,
          labName: r.lab_id?.lab_name || "Unknown Lab",
          date: new Date(r.time_in).toLocaleDateString(),
          time: new Date(r.time_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          duration: formatDuration(new Date(r.time_out).getTime() - new Date(r.time_in).getTime()),
          seat: Array.isArray(r.seat) ? r.seat.join(", ") : r.seat || "N/A",
          status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "Unknown",
          createdOn: new Date(r.createdAt).toLocaleString(),
          rawStart : r.time_in,
          rawEnd   : r.time_out,
          rawSeats : Array.isArray(r.seat) ? r.seat : (r.seat ? r.seat.split(",") : []),
        }));

    } catch (err) {
      console.error("Error loading profile:", err);
    }
  });
</script>

<div class="container mx-auto px-6 py-8 mt-16 bg-offwhite min-h-screen max-w-7xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-surface-700 mb-2">My Lab Reservations</h1>
    <p class="text-surface-500">Manage your upcoming and past laboratory bookings</p>
  </div>

  {#if reservations.length > 0}
    <div class="grid gap-6">
      {#each reservations as reservation, index}
      <div in:fly|global={{ y: 50, duration: 1+index*100, delay: 200, easing: cubicOut }}>
        <Card class="max-w-full border border-surface-200 shadow-md hover:shadow-lg transition-shadow p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div class="flex items-center gap-3 mb-2 sm:mb-0">
              <FlaskOutline class="w-6 h-6 text-primary-600" />
              <h3 class="text-xl font-semibold text-surface-800">{reservation.labName}</h3>
            </div>
            <Badge color={getStatusColor(reservation.status)} class="w-fit">
              {reservation.status}
            </Badge>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

          {#if reservation.status === 'Confirmed' || reservation.status === 'Pending'}
            <div class="flex gap-2 pt-2 border-t border-surface-200">
              <Button 
                size="sm" 
                color="alternative" 
                class="bg-surface-100 text-surface-700 border-surface-300 hover:bg-surface-200"
                onclick={() => editReservation(reservation.id)}
              >
                Edit
              </Button>
              <Button 
                size="sm" 
                color="red" 
                onclick={() => confirmCancel(reservation.id)}
              >
                Cancel
              </Button>
            </div>
          {/if}
        </Card>
        </div>
      {/each}
    </div>

    <!-- Summary Statistics -->
    <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card class="text-center border border-surface-200 bg-success-50">
        <h4 class="text-2xl font-bold text-success-700">
          {reservations.filter(r => r.status === 'Confirmed').length}
        </h4>
        <p class="text-sm text-success-600">Confirmed</p>
      </Card>
      <Card class="text-center border border-surface-200 bg-warning-50">
        <h4 class="text-2xl font-bold text-warning-700">
          {reservations.filter(r => r.status === 'Ongoing').length}
        </h4>
        <p class="text-sm text-warning-600">Current</p>
      </Card>
      <Card class="text-center border border-surface-200 bg-secondary-50">
        <h4 class="text-2xl font-bold text-secondary-700">
          {reservations.filter(r => r.status === 'Completed').length}
        </h4>
        <p class="text-sm text-secondary-600">Completed</p>
      </Card>
      <Card class="text-center border border-surface-200 bg-error-50">
        <h4 class="text-2xl font-bold text-error-700">
          {reservations.filter(r => r.status === 'Cancelled').length}
        </h4>
        <p class="text-sm text-error-600">Cancelled</p>
      </Card>
    </div>

    {#if showDeleteModal}
      <div class="fixed inset-0 z-50 flex justify-center items-center">
        <!-- BACKDROP LAYER -->
        <div class="absolute inset-0 bg-surface-900/10 backdrop-blur-sm"></div>

        <!-- MODAL BOX -->
        <div class="relative bg-white border border-surface-200 shadow-xl rounded-xl p-8 max-w-md w-full text-center">
          <h2 class="text-2xl font-semibold text-surface-800 mb-4">Cancel Reservation?</h2>
          <p class="text-surface-600 mb-6">
            This action cannot be undone. Are you sure you want to cancel this reservation?
          </p>
          <div class="flex justify-center gap-4">
            <Button color="red" class="px-6" onclick={deleteReservation}>Yes, Cancel</Button>
            <Button color="alternative" class="px-6" onclick={() => showDeleteModal = false}>No, Go Back</Button>
          </div>
        </div>
      </div>
    {/if}


    {#if editing}
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-surface-900/10 backdrop-blur-sm"></div>

        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8">
          <h2 class="text-2xl font-semibold text-surface-800 mb-6">Edit Reservation</h2>

          <form class="space-y-5" onsubmit={saveEdit}>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label for="edit-date" class="block text-sm font-medium text-surface-700">Date</label>
                <input id="edit-date" type="date" bind:value={editDate} class="w-full border-surface-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-600" required />
              </div>

              <div class="space-y-1">
                <label for="edit-time" class="block text-sm font-medium text-surface-700">Start&nbsp;time</label>
                <input
                  id="edit-time"
                  type="time"
                  step="1800"
                  bind:value={editStart}
                  class="w-full border-surface-300 rounded-lg px-3 py-2 …"
                  required
                />
              </div>
            </div>

            <div class="space-y-1">
              <label for="edit-hours" class="block text-sm font-medium text-surface-700">Duration&nbsp;(hours)</label>
              <input id="edit-hours" type="number" min="0.5" step="0.5" bind:value={editHours} class="w-full border-surface-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-600" required />
            </div>

            <div class="space-y-1">
              <label for="edit-seats" class="block text-sm font-medium text-surface-700">Seat(s)&nbsp;(comma‑separated)</label>
              <input id="edit-seats" type="text" bind:value={editSeats} class="w-full border-surface-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-600" />
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <Button type="button" color="alternative" onclick={() => editing = null}>Cancel</Button>
              <Button type="submit" color="primary">Save</Button>
            </div>
          </form>
        </div>
      </div>
    {/if}

    {#if successMessage}
      <div class="fixed bottom-4 right-4 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded shadow z-50">
        {successMessage}
        <button class="ml-2 text-green-900 hover:underline" onclick={() => successMessage = ""}>✕</button>
      </div>
    {/if}


  {:else}
    <div class="flex items-center justify-center min-h-[60vh]">
      <Card class="text-center py-12 px-6 border border-surface-200 bg-surface-50 shadow-md max-w-md w-full">
        <FlaskOutline class="w-16 h-16 text-surface-300 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-surface-700 mb-2">No Reservations Found</h3>
        <p class="text-surface-500 mb-4">You haven't made any lab reservations yet.</p>
        <Button
          href="../index.html?view=1"
          tag="a"
          color="primary"
          class="bg-primary-600 hover:bg-primary-700"
        >
          Make Your First Reservation
        </Button>
      </Card>
    </div>
  {/if}
</div>