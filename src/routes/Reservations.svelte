<script>
  import { Card, Button, Badge, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
  // Using correct flowbite-svelte-icons imports
  import { CalendarMonthOutline, ClockOutline, UsersOutline, FlaskOutline } from "flowbite-svelte-icons";

  // Sample reservation data - replace with actual data from your backend
  let reservations = [
    {
      id: 1,
      labName: "GK 211 Laboratory",
      date: "2024-06-20",
      time: "2:00 PM - 4:00 PM",
      duration: "2 hours",
      purpose: "Web Development Project",
      status: "Confirmed",
      equipmentRequested: ["Projector", "Whiteboard"]
    },
    {
      id: 2,
      labName: "GK 403 Network Laboratory",
      date: "2024-06-22",
      time: "10:00 AM - 12:00 PM",
      duration: "2 hours",
      purpose: "LBYITN4 Networking Activity",
      status: "Ongoing",
      equipmentRequested: ["Crossover Cable", "Console Cable"]
    },
    {
      id: 3,
      labName: "AG 1703 Laboratory",
      date: "2024-06-18",
      time: "3:00 PM - 5:00 PM",
      duration: "2 hours",
      purpose: "CCAPDEV MC01 Presentation",
      status: "Completed",
      equipmentRequested: ["Projector", "Laser Pointer"]
    },
    {
      id: 4,
      labName: "AG 1707 Laboratory",
      date: "2024-06-18",
      time: "3:00 PM - 8:30 PM",
      duration: "5.5 hours",
      purpose: "CCAPDEV MC01 Presentation",
      status: "Cancelled",
      equipmentRequested: ["Projector", "Laser Pointer"]
    }

  ];

  function getStatusColor(status) {
    switch(status) {
      case 'Confirmed': return 'green';
      case 'Ongoing': return 'yellow';
      case 'Completed': return 'blue';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  }

  function cancelReservation(id) {
    reservations = reservations.map(res => 
      res.id === id ? {...res, status: 'Cancelled'} : res
    );
  }

  function editReservation(id) {
    // Implement edit functionality
    console.log('Edit reservation:', id);
  }
</script>

<div class="container mx-auto px-6 py-8 mt-16 bg-offwhite min-h-screen max-w-7xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-surface-700 mb-2">My Lab Reservations</h1>
    <p class="text-surface-500">Manage your upcoming and past laboratory bookings</p>
  </div>

  {#if reservations.length > 0}
    <div class="grid gap-6">
      {#each reservations as reservation (reservation.id)}
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
          </div>

          <!-- {#if reservation.equipmentRequested.length > 0}
            <div class="mb-4">
              <p class="text-sm font-medium text-surface-700 mb-2 text-left">Equipment Requested:</p>
              <div class="flex flex-wrap gap-2">
                {#each reservation.equipmentRequested as equipment}
                  <Badge class="text-xs bg-surface-100 text-surface-600 border border-surface-300">{equipment}</Badge>
                {/each}
              </div>
            </div>
          {/if} -->

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
                onclick={() => cancelReservation(reservation.id)}
              >
                Cancel
              </Button>
            </div>
          {/if}
        </Card>
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

  {:else}
    <Card class="text-center py-12 border border-surface-200 bg-surface-50">
      <FlaskOutline class="w-16 h-16 text-surface-300 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-surface-700 mb-2">No Reservations Found</h3>
      <p class="text-surface-500 mb-4">You haven't made any lab reservations yet.</p>
      <Button color="primary" class="bg-primary-600 hover:bg-primary-700">Make Your First Reservation</Button>
    </Card>
  {/if}
</div>