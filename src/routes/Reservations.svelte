<script>
  import { Card, Button, Badge, Modal, Input, Label } from "flowbite-svelte";
  import { CalendarMonthOutline, ClockOutline, UsersOutline, FlaskOutline, ComputerSpeakerOutline, PlusOutline, EditOutline, TrashBinOutline } from "flowbite-svelte-icons";  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import Particles from "../lib/components/Particles.svelte";

  // State variables
  let reservations = [];
  let isLoading = true;
  let error = null;
  let showCancelModal = false;
  let reservationToCancel = null;
  let showEditModal = false;
  let editingReservation = null;
  let showCreateModal = false;
  let newReservation = {
    lab_id: '',
    date: '',
    time_in: '',
    time_out: '',
    seat: '',
    isAnonymous: false
  };
  let availableLabs = [];
  let availableSeats = [];
  let toastMessage = "";
  let showToast = false;
  let currentUser = null;

  // DEBUG MARKERS - Add debug state
  let debugInfo = {
    userLoadStatus: "Not started",
    reservationLoadStatus: "Not started",
    authToken: null,
    apiResponses: [],
    errors: []
  };

  // Particles settings
  let qty = 35;
  let vx = -1;
  let vy = 1;
  let size = 50;
  let staticity = 20;
  let color = "#bad6e9";

  // DEBUG MARKER 1: Enhanced error logging function
  function logDebugInfo(stage, data, isError = false) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, stage, data, isError };
    
    if (isError) {
      debugInfo.errors.push(logEntry);
      console.error(`[DEBUG ERROR ${timestamp}] ${stage}:`, data);
    } else {
      debugInfo.apiResponses.push(logEntry);
      console.log(`[DEBUG INFO ${timestamp}] ${stage}:`, data);
    }
    
    // Trigger reactivity
    debugInfo = { ...debugInfo };
  }

  // Fetch user data and reservations on component mount
  onMount(async () => {
    logDebugInfo("Component Mount", "Starting onMount");
    
    try {
      // DEBUG MARKER 2: Check token existence
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      debugInfo.authToken = token ? "Present" : "Missing";
      logDebugInfo("Token Check", { tokenExists: !!token, tokenLength: token?.length });
      
      if (token) {
        debugInfo.userLoadStatus = "Loading";
        logDebugInfo("User Fetch", "Starting user fetch request");
        
        const userResponse = await fetch('http://localhost:3000/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // DEBUG MARKER 3: Log response details
        logDebugInfo("User Response", {
          status: userResponse.status,
          statusText: userResponse.statusText,
          ok: userResponse.ok,
          headers: Object.fromEntries(userResponse.headers.entries())
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          logDebugInfo("User Data", userData);
          
          currentUser = {
            id: userData._id || userData.id,
            name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            original_id: userData.id,
            original_id_type: typeof userData.id
          };
          
          debugInfo.userLoadStatus = "Success";
          logDebugInfo("Current User Set", currentUser);
          
          await fetchReservations();
        } else {
          // DEBUG MARKER 4: Enhanced error details for failed auth
          const errorText = await userResponse.text();
          debugInfo.userLoadStatus = "Failed";
          logDebugInfo("User Auth Failed", {
            status: userResponse.status,
            statusText: userResponse.statusText,
            responseBody: errorText
          }, true);
          
          error = `Failed to authenticate user (Status: ${userResponse.status})`;
          isLoading = false;
        }
      } else {
        debugInfo.userLoadStatus = "No Token";
        logDebugInfo("No Token", "User not authenticated", true);
        // Set empty reservations instead of error for no token
        reservations = [];
        currentUser = null;
        isLoading = false;
      }
    } catch (err) {
      // DEBUG MARKER 5: Catch block with enhanced error info
      debugInfo.userLoadStatus = "Error";
      logDebugInfo("Mount Error", {
        message: err.message,
        stack: err.stack,
        name: err.name
      }, true);
      
      error = "Failed to load reservations: " + err.message;
      console.error(err);
      isLoading = false;
    }
  });

  // Fetch reservations from API
  async function fetchReservations() {
    if (!currentUser) {
      logDebugInfo("Fetch Reservations", "No current user, skipping", true);
      return;
    }
    
    try {
      isLoading = true;
      debugInfo.reservationLoadStatus = "Loading";
      logDebugInfo("Reservations Fetch", "Starting reservations fetch");
      
      const response = await fetch('http://localhost:3000/reservations');
      
      // DEBUG MARKER 6: Log reservations response
      logDebugInfo("Reservations Response", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      logDebugInfo("Reservations Raw Data", {
        dataLength: data.length,
        sampleData: data.slice(0, 2), // First 2 items for debugging
        dataTypes: data.map(item => typeof item)
      });
      
      // DEBUG MARKER 7: Enhanced filtering with detailed logging
      const filteredReservations = data.filter(res => {
        const userId = res.user_id?._id || res.user_id;
        const currentUserId = currentUser.id;
        const matches = userId === currentUserId || userId?.toString() === currentUserId?.toString();
        
        // Log every reservation for debugging
        logDebugInfo("Reservation Filter Check", {
          reservationId: res._id,
          userId: userId,
          currentUserId: currentUserId,
          userIdType: typeof userId,
          currentUserIdType: typeof currentUserId,
          matches: matches,
          labName: res.lab_id?.lab_name || 'Unknown',
          status: res.status,
          time_in: res.time_in
        });
        
        return matches;
      });
      
      logDebugInfo("Filtered Reservations", {
        originalCount: data.length,
        filteredCount: filteredReservations.length,
        currentUserId: currentUser.id
      });
      
      // DEBUG MARKER 8: Enhanced mapping with error handling
      reservations = filteredReservations.map((res, index) => {
        try {
          const mapped = {
            id: res._id,
            labName: res.lab_id?.lab_name || 'Unknown Lab',
            date: new Date(res.time_in).toLocaleDateString(),
            time: `${new Date(res.time_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(res.time_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            duration: calculateDuration(res.time_in, res.time_out),
            status: res.status,
            seat: res.seat || "N/A",
            time_in: formatTimeForInput(res.time_in),
            time_out: formatTimeForInput(res.time_out),
            lab_id: res.lab_id?._id || res.lab_id,
            user_id: res.user_id?._id || res.user_id,
            createdOn: new Date(res.createdAt || res.time_in).toLocaleDateString(),
            isAnonymous: res.isAnonymous || false
          };
          
          if (index === 0) {
            logDebugInfo("Sample Mapped Reservation", mapped);
          }
          
          return mapped;
        } catch (mapError) {
          logDebugInfo("Mapping Error", {
            index,
            error: mapError.message,
            originalData: res
          }, true);
          
          return {
            id: res._id || `error-${index}`,
            labName: 'Error Loading',
            date: 'N/A',
            time: 'N/A',
            duration: 'N/A',
            status: 'Error',
            seat: 'N/A',
            time_in: '00:00',
            time_out: '00:00',
            lab_id: '',
            user_id: '',
            createdOn: 'N/A',
            isAnonymous: false
          };
        }
      });
      
      debugInfo.reservationLoadStatus = "Success";
      logDebugInfo("Final Reservations", {
        count: reservations.length,
        sample: reservations.slice(0, 1)
      });
      
    } catch (err) {
      // DEBUG MARKER 9: Enhanced error handling for reservations
      debugInfo.reservationLoadStatus = "Error";
      logDebugInfo("Reservations Fetch Error", {
        message: err.message,
        stack: err.stack,
        name: err.name
      }, true);
      
      error = "Failed to fetch reservations: " + err.message;
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  // Helper function to format time for input fields
  function formatTimeForInput(dateString) {
    try {
      const date = new Date(dateString);
      const formatted = date.toTimeString().slice(0, 5);
      return formatted;
    } catch (err) {
      logDebugInfo("Time Format Error", { dateString, error: err.message }, true);
      return '00:00';
    }
  }

  // Calculate duration between two dates
  function calculateDuration(start, end) {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diff = (endDate - startDate) / (1000 * 60 * 60); // hours
      
      if (diff < 1) {
        return `${Math.round(diff * 60)} minutes`;
      } else if (diff % 1 === 0) {
        return `${diff} hours`;
      } else {
        const hours = Math.floor(diff);
        const minutes = Math.round((diff % 1) * 60);
        return `${hours}h ${minutes}m`;
      }
    } catch (err) {
      logDebugInfo("Duration Calculation Error", { start, end, error: err.message }, true);
      return "N/A";
    }
  }

  // DEBUG MARKER 10: Enhanced fetch labs with error handling
  async function fetchLabs() {
    try {
      logDebugInfo("Labs Fetch", "Starting labs fetch");
      const response = await fetch('http://localhost:3000/labs');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const labs = await response.json();
      logDebugInfo("Labs Response", { count: labs.length, sample: labs.slice(0, 1) });
      
      availableLabs = labs;
    } catch (err) {
      logDebugInfo("Labs Fetch Error", { error: err.message }, true);
      console.error('Failed to fetch labs:', err);
      availableLabs = [];
    }
  }

  // Fetch available seats when lab/time changes
  async function fetchAvailableSeats() {
    if (!newReservation.lab_id || !newReservation.date || !newReservation.time_in || !newReservation.time_out) {
      availableSeats = [];
      return;
    }

    try {
      logDebugInfo("Seats Fetch", {
        lab_id: newReservation.lab_id,
        date: newReservation.date,
        time_in: newReservation.time_in,
        time_out: newReservation.time_out
      });
      
      const response = await fetch(`http://localhost:3000/available-seats/${newReservation.lab_id}?date=${newReservation.date}&time_in=${newReservation.time_in}&time_out=${newReservation.time_out}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      logDebugInfo("Seats Response", { available_seats: data.available_seats?.length || 0 });
      
      availableSeats = data.available_seats || [];
    } catch (err) {
      logDebugInfo("Seats Fetch Error", { error: err.message }, true);
      console.error('Failed to fetch available seats:', err);
      availableSeats = [];
    }
  }

  // Fetch available seats for editing
  async function fetchAvailableSeatsForEdit() {
    if (!editingReservation?.lab_id || !editingReservation?.date || !editingReservation?.time_in || !editingReservation?.time_out) {
      return;
    }

    try {
      logDebugInfo("Edit Seats Fetch", {
        lab_id: editingReservation.lab_id,
        date: editingReservation.date,
        time_in: editingReservation.time_in,
        time_out: editingReservation.time_out
      });
      
      const response = await fetch(`http://localhost:3000/available-seats/${editingReservation.lab_id}?date=${editingReservation.date}&time_in=${editingReservation.time_in}&time_out=${editingReservation.time_out}&exclude_reservation=${editingReservation.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      logDebugInfo("Edit Seats Response", { available_seats: data.available_seats?.length || 0 });
      
      availableSeats = data.available_seats || [];
      
      // Add current seat to available seats if not already there
      if (editingReservation.seat && !availableSeats.find(s => s.position === editingReservation.seat)) {
        availableSeats.unshift({ position: editingReservation.seat });
      }
    } catch (err) {
      logDebugInfo("Edit Seats Fetch Error", { error: err.message }, true);
      console.error('Failed to fetch available seats for edit:', err);
      availableSeats = [{ position: editingReservation.seat }]; // Fallback to current seat
    }
  }

  // Create new reservation
  async function createReservation() {
    try {
      const token = localStorage.getItem('accessToken');
      logDebugInfo("Create Reservation", {
        hasToken: !!token,
        currentUser: currentUser,
        newReservation: newReservation
      });
      
      const response = await fetch('http://localhost:3000/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: newReservation.date,
          time_start: newReservation.time_in,
          hours: calculateHoursFromTimes(newReservation.time_in, newReservation.time_out),
          user_id: currentUser.id,
          lab_id: newReservation.lab_id,
          isAnonymous: newReservation.isAnonymous || false,
          seats: [newReservation.seat]
        })
      });

      logDebugInfo("Create Response", {
        status: response.status,
        ok: response.ok
      });

      if (response.ok) {
        showSuccessToast("Reservation created successfully");
        await fetchReservations();
        resetNewReservation();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create reservation");
      }
    } catch (err) {
      logDebugInfo("Create Error", { error: err.message }, true);
      showErrorToast("Error creating reservation: " + err.message);
      console.error(err);
    } finally {
      showCreateModal = false;
    }
  }

  // Helper function to calculate hours between two times
  function calculateHoursFromTimes(startTime, endTime) {
    try {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return (endMinutes - startMinutes) / 60;
    } catch (err) {
      logDebugInfo("Hours Calculation Error", { startTime, endTime, error: err.message }, true);
      return 1; // Default to 1 hour
    }
  }

  // Reset new reservation form
  function resetNewReservation() {
    newReservation = {
      lab_id: '',
      date: '',
      time_in: '',
      time_out: '',
      seat: '',
      isAnonymous: false
    };
    availableSeats = [];
  }

  // Open create modal
  function openCreateModal() {
    console.log("openCreateModal called");
    logDebugInfo("Modal Open", "Create modal opening");
    resetNewReservation();
    fetchLabs();
    showCreateModal = true;
  }

  // Open cancel confirmation modal
   function openCancelModal(reservation) {
    console.log("openCancelModal called with:", reservation);
    logDebugInfo("Cancel Modal", { reservation });
    reservationToCancel = reservation;
    showCancelModal = true;
    
    // DEBUG: Log modal state
    console.log("showCancelModal set to:", showCancelModal);
    console.log("reservationToCancel set to:", reservationToCancel);
    
    // Force reactivity update
    showCancelModal = showCancelModal;
  }

  // Cancel reservation
  async function confirmCancel() {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Try different endpoints for cancellation
      let response;
      let url;
      
      // First try: POST to cancel endpoint
      try {
        url = `http://localhost:3000/reservations/${reservationToCancel.id}/cancel`;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({})
        });
        
        if (!response.ok && response.status === 404) {
          throw new Error('Cancel endpoint not found');
        }
      } catch (firstError) {
        logDebugInfo("Cancel first attempt failed", { url, error: firstError.message });
        
        // Second try: PATCH method
        try {
          url = `http://localhost:3000/reservations/${reservationToCancel.id}`;
          response = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'Cancelled' })
          });
          
          if (!response.ok && response.status === 404) {
            throw new Error('PATCH method not found');
          }
        } catch (secondError) {
          logDebugInfo("Cancel second attempt failed", { url, error: secondError.message });
          
          // Third try: POST to general cancel endpoint
          url = `http://localhost:3000/reservations/cancel`;
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              reservation_id: reservationToCancel.id,
              status: 'Cancelled'
            })
          });
        }
      }

      if (response.ok) {
        showSuccessToast("Reservation cancelled successfully");
        await fetchReservations();
      } else {
        // Handle non-JSON error responses
        let errorMessage;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || "Failed to cancel reservation";
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      logDebugInfo("Cancel Error", { error: err.message }, true);
      showErrorToast("Error cancelling reservation: " + err.message);
      console.error(err);
    } finally {
      showCancelModal = false;
      reservationToCancel = null;
    }
  }

  // Open edit modal
  function openEditModal(reservation) {
    try {
      console.log("openEditModal called with:", reservation);
      logDebugInfo("Edit Modal", { reservation });
      
      // Fetch labs for dropdown
      fetchLabs();
      
      editingReservation = {
        ...reservation,
        date: new Date(reservation.date).toISOString().split('T')[0], // Format for date input
        original_lab_id: reservation.lab_id,
        isAnonymous: reservation.isAnonymous || false
      };
      
      showEditModal = true;
      
      // DEBUG: Log modal state
      console.log("showEditModal set to:", showEditModal);
      console.log("editingReservation set to:", editingReservation);
      
      // Force reactivity update
      showEditModal = showEditModal;
      
      // Fetch available seats for the current lab and time
      setTimeout(() => {
        fetchAvailableSeatsForEdit();
      }, 100);
      
    } catch (err) {
      logDebugInfo("Edit Modal Error", { error: err.message }, true);
      console.error('Error opening edit modal:', err);
      showErrorToast("Error opening edit form");
    }
  }

  // Save edited reservation
  async function saveEdit() {
    if (!editingReservation) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const updateData = {
        date: editingReservation.date,
        time_start: editingReservation.time_in,
        hours: calculateHoursFromTimes(editingReservation.time_in, editingReservation.time_out),
        lab_id: editingReservation.lab_id,
        seats: [editingReservation.seat],
        isAnonymous: editingReservation.isAnonymous || false
      };
      
      logDebugInfo("Edit Update Data", updateData);
      
      // Try different endpoints/methods
      let response;
      let url;
      
      // First try: POST to update endpoint
      try {
        url = `http://localhost:3000/reservations/${editingReservation.id}/update`;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok && response.status === 404) {
          throw new Error('Update endpoint not found');
        }
      } catch (firstError) {
        logDebugInfo("First attempt failed", { url, error: firstError.message });
        
        // Second try: PATCH method
        try {
          url = `http://localhost:3000/reservations/${editingReservation.id}`;
          response = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          });
          
          if (!response.ok && response.status === 404) {
            throw new Error('PATCH method not found');
          }
        } catch (secondError) {
          logDebugInfo("Second attempt failed", { url, error: secondError.message });
          
          // Third try: POST to general reservations endpoint with ID in body
          url = `http://localhost:3000/reservations/update`;
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ...updateData,
              reservation_id: editingReservation.id
            })
          });
        }
      }

      logDebugInfo("Final response", {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        showSuccessToast("Reservation updated successfully");
        await fetchReservations();
      } else {
        // Handle non-JSON error responses
        let errorMessage;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || "Failed to update reservation";
        } else {
          // If it's HTML or plain text, just use the status
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      logDebugInfo("Edit Error", { error: err.message }, true);
      showErrorToast("Error updating reservation: " + err.message);
      console.error(err);
    } finally {
      showEditModal = false;
      editingReservation = null;
      availableSeats = [];
    }
  }

  // Helper functions for button clicks
  function handleEditClick(reservation) {
    console.log('Edit button clicked for reservation:', reservation.id);
    logDebugInfo("Edit Button Click", { reservation });
    openEditModal(reservation);
  }

  function handleCancelClick(reservation) {
    console.log('Cancel button clicked for reservation:', reservation.id);
    logDebugInfo("Cancel Button Click", { reservation });
    openCancelModal(reservation);
  }

  // Toast functions
  function showSuccessToast(message) {
    toastMessage = message;
    showToast = true;
    setTimeout(() => {
      showToast = false;
    }, 3000);
  }

  function showErrorToast(message) {
    toastMessage = message;
    showToast = true;
    setTimeout(() => {
      showToast = false;
    }, 5000);
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
</script>

<div class="container mx-auto px-6 py-8 mt-16 bg-offwhite min-h-screen max-w-7xl">
  <!-- DEBUG MARKER 11: Debug Panel (remove in production) -->
  <div class="mb-4 p-4 bg-gray-100 border rounded-lg text-xs">
    <h4 class="font-bold mb-2">Debug Information:</h4>
    <div class="grid grid-cols-2 gap-2">
      <div><strong>User Load:</strong> {debugInfo.userLoadStatus}</div>
      <div><strong>Reservations Load:</strong> {debugInfo.reservationLoadStatus}</div>
      <div><strong>Auth Token:</strong> {debugInfo.authToken}</div>
      <div><strong>Current User:</strong> {currentUser ? `${currentUser.name} (${currentUser.id})` : 'None'}</div>
      <div><strong>Reservations Count:</strong> {reservations.length}</div>
      <div><strong>Errors Count:</strong> {debugInfo.errors.length}</div>
      <div class="col-span-2"><strong>Raw Reservations Count:</strong> {debugInfo.apiResponses.find(r => r.stage === 'Reservations Raw Data')?.data?.dataLength || 'Not loaded'}</div>
    </div>
    {#if debugInfo.errors.length > 0}
      <div class="mt-2">
        <strong>Recent Errors:</strong>
        {#each debugInfo.errors.slice(-3) as errorLog}
          <div class="text-red-600 text-xs">[{errorLog.timestamp.slice(11, 19)}] {errorLog.stage}: {JSON.stringify(errorLog.data)}</div>
        {/each}
      </div>
    {/if}
    {#if debugInfo.apiResponses.find(r => r.stage === 'Reservations Raw Data')}
      <div class="mt-2">
        <strong>Sample Raw Reservation:</strong>
        <div class="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(debugInfo.apiResponses.find(r => r.stage === 'Reservations Raw Data')?.data?.sampleData?.[0] || 'None', null, 2)}</div>
      </div>
    {/if}
  </div>

  <!-- Toast notification -->
  {#if showToast}
    <div class="fixed top-4 right-4 z-50 bg-white border border-surface-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div class="flex items-center">
        <div class="flex-1">
          <p class="text-sm text-surface-700">{toastMessage}</p>
        </div>
        <button on:click={() => showToast = false} class="ml-3 text-surface-400 hover:text-surface-600">
          ✕
        </button>
      </div>
    </div>
  {/if}

  <!-- Background particles -->
  <div class="fixed inset-0 -z-50 pointer-events-none">
    <Particles className="absolute inset-0" refresh={true} {color} {staticity} quantity={qty} {size} {vx} {vy} />
  </div>

  <div class="mb-8">
    <h1 class="text-3xl font-bold text-surface-700 mb-2">My Lab Reservations</h1>
    <p class="text-surface-500">Manage your upcoming and past laboratory bookings</p>
  </div>

  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      <p class="ml-4">Loading reservations...</p>
    </div>
  {:else if error}
    <Card class="text-center py-12 border border-error-200 bg-error-50">
      <FlaskOutline class="w-16 h-16 text-error-300 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-error-700 mb-2">Error Loading Reservations</h3>
      <p class="text-error-500 mb-4">{error}</p>
      <Button color="primary" on:click={fetchReservations}>Try Again</Button>
    </Card>
  {:else}
    <div class="flex justify-between items-center mb-6 relative z-10">
      {#if currentUser}
        <Button color="primary" on:click={openCreateModal} class="relative z-20">
          <PlusOutline class="w-4 h-4 mr-2" />
          New Reservation
        </Button>
        <!-- TEST BUTTON -->
        <Button color="secondary" on:click={() => alert('Test button works!')} class="relative z-20">
          Test Click
        </Button>
      {:else}
        <Button color="primary" on:click={() => window.location.href = '/login'} class="relative z-20">
          <PlusOutline class="w-4 h-4 mr-2" />
          Log In to Make Reservations
        </Button>
      {/if}
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

            <p class="text-xs text-surface-400 mt-2">Created on: {reservation.createdOn}</p>

            {#if reservation.status === 'Confirmed' || reservation.status === 'Ongoing'}
              <div class="flex gap-2 pt-2 border-t border-surface-200 mt-4">
                <button 
                  type="button"
                  class="px-3 py-1 text-sm bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition-colors cursor-pointer"
                  on:click={() => handleEditClick(reservation)}
                >
                  ✏️ Edit
                </button>
                <button 
                  type="button"
                  class="px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 transition-colors cursor-pointer"
                  on:click={() => handleCancelClick(reservation)}
                >
                  🗑️ Cancel
                </button>
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

    {:else}
      <Card class="text-center py-12 border border-surface-200 bg-surface-50">
        <FlaskOutline class="w-16 h-16 text-surface-300 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-surface-700 mb-2">No Reservations Found</h3>
        {#if !currentUser}
          <p class="text-surface-500 mb-4">Please log in to view your reservations.</p>
          <Button color="primary" class="bg-primary-600 hover:bg-primary-700 relative z-20" on:click={() => window.location.href = '/login'}>Log In</Button>
        {:else}
          <p class="text-surface-500 mb-4">You haven't made any lab reservations yet.</p>
          <Button color="primary" class="bg-primary-600 hover:bg-primary-700 relative z-20" on:click={openCreateModal}>Make Your First Reservation</Button>
        {/if}
      </Card>
    {/if}
  {/if}

  <!-- Create Reservation Modal -->
  {#if showCreateModal}
    <Modal bind:open={showCreateModal} autoclose outsideclose>
      <div slot="header" class="text-lg font-semibold">Create New Reservation</div>
      <div class="space-y-4">
        <div>
          <Label for="lab-select" class="mb-2">Lab</Label>
          <select 
            id="lab-select" 
            class="w-full p-2 border border-surface-300 rounded-md"
            bind:value={newReservation.lab_id}
            on:change={fetchAvailableSeats}
          >
            <option value="">Select a lab</option>
            {#each availableLabs as lab}
              <option value={lab._id}>{lab.lab_name}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <Label for="reservation-date" class="mb-2">Date</Label>
          <Input 
            id="reservation-date" 
            type="date" 
            bind:value={newReservation.date}
            on:change={fetchAvailableSeats}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="start-time" class="mb-2">Start Time</Label>
            <Input 
              id="start-time" 
              type="time" 
              bind:value={newReservation.time_in}
              on:change={fetchAvailableSeats}
            />
          </div>
          <div>
            <Label for="end-time" class="mb-2">End Time</Label>
            <Input 
              id="end-time" 
              type="time" 
              bind:value={newReservation.time_out}
              on:change={fetchAvailableSeats}
            />
          </div>
        </div>

        <div>
          <Label for="seat-select" class="mb-2">Seat</Label>
          <select 
            id="seat-select" 
            class="w-full p-2 border border-surface-300 rounded-md"
            bind:value={newReservation.seat}
            disabled={availableSeats.length === 0}
          >
            <option value="">Select a seat</option>
            {#each availableSeats as seat}
              <option value={seat.position}>{seat.position}</option>
            {/each}
          </select>
          {#if availableSeats.length === 0 && newReservation.lab_id}
            <p class="text-sm text-warning-600 mt-1">No seats available for selected time</p>
          {/if}
        </div>

        <div class="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="anonymous-reservation"
            bind:checked={newReservation.isAnonymous}
            class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
          />
          <Label for="anonymous-reservation" class="text-sm">Make this reservation anonymous</Label>
        </div>

        {#if newReservation.time_in && newReservation.time_out}
          <div class="bg-surface-50 p-3 rounded-md">
            <p class="text-sm text-surface-600">
              <strong>Duration:</strong> {calculateHoursFromTimes(newReservation.time_in, newReservation.time_out)} hours
            </p>
          </div>
        {/if}
        
        <div class="flex justify-end gap-3 pt-4">
          <Button color="alternative" on:click={() => showCreateModal = false}>Cancel</Button>
          <Button 
            color="primary" 
            on:click={createReservation} 
            disabled={!newReservation.lab_id || !newReservation.date || !newReservation.time_in || !newReservation.time_out || !newReservation.seat}
          >
            Create Reservation
          </Button>
        </div>
      </div>
    </Modal>
  {/if}

  <!-- Cancel Confirmation Modal -->
  {#if showCancelModal && reservationToCancel}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-surface-800">Cancel Reservation</h3>
          <button 
            on:click={() => showCancelModal = false}
            class="text-surface-400 hover:text-surface-600"
          >
            ✕
          </button>
        </div>
        
        <div class="mb-6">
          <p class="text-surface-700 mb-4">Are you sure you want to cancel your reservation?</p>
          <div class="bg-surface-50 p-4 rounded-lg border">
            <div class="flex items-center gap-2 mb-2">
              <FlaskOutline class="w-4 h-4 text-surface-500" />
              <span class="font-medium text-surface-700">{reservationToCancel.labName}</span>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <CalendarMonthOutline class="w-4 h-4 text-surface-500" />
              <span class="text-sm text-surface-600">{reservationToCancel.date}</span>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <ClockOutline class="w-4 h-4 text-surface-500" />
              <span class="text-sm text-surface-600">{reservationToCancel.time}</span>
            </div>
            <div class="flex items-center gap-2">
              <ComputerSpeakerOutline class="w-4 h-4 text-surface-500" />
              <span class="text-sm text-surface-600">Seat {reservationToCancel.seat}</span>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3">
          <button 
            class="px-4 py-2 text-sm border border-surface-300 rounded-md hover:bg-surface-50 transition-colors"
            on:click={() => showCancelModal = false}
          >
            Keep Reservation
          </button>
          <button 
            class="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            on:click={confirmCancel}
          >
            Cancel Reservation
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Edit Reservation Modal -->
  {#if showEditModal && editingReservation}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-surface-800">Edit Reservation</h3>
            <button 
              on:click={() => showEditModal = false}
              class="text-surface-400 hover:text-surface-600"
            >
              ✕
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Lab Selection -->
            <div>
              <Label class="text-sm font-medium text-surface-700 mb-2">Laboratory</Label>
              <select 
                class="w-full p-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                bind:value={editingReservation.lab_id}
                on:change={fetchAvailableSeatsForEdit}
              >
                <option value="">Select a laboratory</option>
                {#each availableLabs as lab}
                  <option value={lab._id}>{lab.lab_name}</option>
                {/each}
              </select>
            </div>

            <!-- Date Selection -->
            <div>
              <Label class="text-sm font-medium text-surface-700 mb-2">Date</Label>
              <Input 
                type="date" 
                bind:value={editingReservation.date}
                on:change={fetchAvailableSeatsForEdit}
                min={new Date().toISOString().split('T')[0]}
                class="w-full p-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <!-- Time Selection -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="text-sm font-medium text-surface-700 mb-2">Start Time</Label>
                <Input 
                  type="time" 
                  bind:value={editingReservation.time_in}
                  on:change={fetchAvailableSeatsForEdit}
                  class="w-full p-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <Label class="text-sm font-medium text-surface-700 mb-2">End Time</Label>
                <Input 
                  type="time" 
                  bind:value={editingReservation.time_out}
                  on:change={fetchAvailableSeatsForEdit}
                  class="w-full p-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <!-- Seat Selection -->
            <div>
              <Label class="text-sm font-medium text-surface-700 mb-2">Seat</Label>
              <select 
                class="w-full p-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                bind:value={editingReservation.seat}
              >
                <option value="">Select a seat</option>
                {#each availableSeats as seat}
                  <option value={seat.position}>Seat {seat.position}</option>
                {/each}
              </select>
              {#if availableSeats.length === 0 && editingReservation.lab_id}
                <p class="text-sm text-warning-600 mt-2">No seats available for selected time</p>
              {/if}
            </div>

            <!-- Anonymous Option -->
            <div class="flex items-center space-x-3">
              <input 
                type="checkbox" 
                id="edit-anonymous"
                bind:checked={editingReservation.isAnonymous}
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <Label for="edit-anonymous" class="text-sm text-surface-700">Make this reservation anonymous</Label>
            </div>

            <!-- Duration Display -->
            {#if editingReservation.time_in && editingReservation.time_out}
              <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div class="flex items-center gap-2">
                  <ClockOutline class="w-4 h-4 text-primary-600" />
                  <span class="text-sm font-medium text-primary-700">
                    Duration: {calculateHoursFromTimes(editingReservation.time_in, editingReservation.time_out)} hours
                  </span>
                </div>
              </div>
            {/if}
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-6 mt-6 border-t border-surface-200">
            <button 
              class="px-4 py-2 text-sm border border-surface-300 rounded-md hover:bg-surface-50 transition-colors"
              on:click={() => showEditModal = false}
            >
              Cancel
            </button>
            <button 
              class="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              on:click={saveEdit}
              disabled={!editingReservation.lab_id || !editingReservation.date || !editingReservation.time_in || !editingReservation.time_out || !editingReservation.seat}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
