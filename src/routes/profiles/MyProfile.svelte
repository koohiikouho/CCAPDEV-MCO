<script lang="ts">
  import {
    Avatar, Button, Modal, Input, Label, Badge, Card
  } from "flowbite-svelte";
  import {
    CalendarMonthOutline, ClockOutline, UsersOutline,
    FlaskOutline, ComputerSpeakerOutline
  } from "flowbite-svelte-icons";
  import TempNavbar from "../../lib/components/TempNavbar.svelte";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { updateUserProfile } from "../../../api/api.js";

  let currentUser = null;
  let reservations = [];
  let showEditModal = false;
  let showDeleteModal = false;
  let editableUser = null;
  let avatarUploading = false;
  let confirmPassword = "";
  let deleteErrorMessage = "";

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

  async function saveProfile() {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem('accessToken');
      if (!token) throw new Error("No access token");

      let payload = {
        name: editableUser.name,
        bio: editableUser.bio,
        avatar: editableUser.avatar
      };

      console.log("Saving profile with payload:", payload);

      const result = await updateUserProfile(payload, token);

      if (result.error) {
        console.error("Update failed:", result.error);
        return;
      }

      currentUser = { ...currentUser, ...editableUser };
      showEditModal = false;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }

  async function deleteUser() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token");

      const res = await fetch("http://localhost:3000/users/me", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: confirmPassword })
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorData = await res.json();
          deleteErrorMessage = errorData.message || "Failed to delete user.";
        } else {
          const errorText = await res.text();
          deleteErrorMessage = errorText || "Something went wrong.";
        }
        return;
      }

      localStorage.removeItem("accessToken");
      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting user:", err);
      deleteErrorMessage = "Something went wrong. Please try again.";
    }
  }

  onMount(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return console.error("No access token found");

    try {
      const resUser = await fetch("http://localhost:3000/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resUser.ok) throw new Error("Failed to fetch user data");

      const user = await resUser.json();
      currentUser = {
        _id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio || "No description provided.",
      };

      const resReservations = await fetch("http://localhost:3000/reservations");
      const all = await resReservations.json();

      reservations = all
        .filter(r => String(r.user_id?._id || r.user_id) === currentUser._id)
        .map((r, index) => ({
          labName: r.lab_id?.lab_name || "Unknown Lab",
          date: new Date(r.time_in).toLocaleDateString(),
          time: new Date(r.time_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          duration:
            r.time_in && r.time_out &&
            new Date(r.time_out).getTime() > new Date(r.time_in).getTime()
              ? formatDuration(new Date(r.time_out).getTime() - new Date(r.time_in).getTime())
              : "Invalid time",
          seat: r.seat || "N/A",
          status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "Unknown",
          createdOn: new Date(r.createdAt).toLocaleString(),
        }));
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  });
</script>

<TempNavbar
  userName={currentUser?.name || "Loading..."}
  userEmail={currentUser?.email || "Loading..."}
  profilePicture={getAvatar(currentUser?.avatar)}
  isLoggedIn={!!currentUser}
/>

{#if currentUser}
<main class="mt-10 p-10 sm:p-20 bg-primary-50 min-h-screen text-surface-800">
  <div class="grid grid-cols-1 gap-10 max-w-6xl mx-auto bg-white p-10 rounded-xl shadow-2xl">
    <div class="grid md:grid-cols-3 gap-10">
      <div class="flex flex-col items-center">
        <Avatar
          src={getAvatar(currentUser.avatar)}
          class="w-70 h-70 rounded-full ring-4 ring-primary-500 shadow-lg object-cover mb-10"
        />
        <Button
          color="primary"
          onclick={() => {
            editableUser = { ...currentUser };
            showEditModal = true;
          }}
        >
          Edit Profile
        </Button>

        <Button
          color="red"
          class="mt-3"
          onclick={() => showDeleteModal = true}
        >
          Delete Account
        </Button>

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
                  <Badge color={getStatusColor(reservation.status)} class="w-fit">{reservation.status}</Badge>
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
                <p class="text-xs text-surface-400 mt-2">Created on: {reservation.createdOn}</p>
              </Card>
            </div>
          {/each}
        </div>
      {:else}
        <Card class="text-center py-12 border border-surface-200 bg-surface-50 mt-10 mx-auto">
          <FlaskOutline class="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-surface-700 mb-2">No Reservations Found</h3>
          <p class="text-surface-500">You haven't made any lab reservations yet.</p>
        </Card>
      {/if}
    </div>
  </div>
</main>

<Modal open={showEditModal} onclose={() => (showEditModal = false)} class="z-50">
  <div class="p-6 space-y-6">
    <h3 class="text-xl font-medium text-surface-800">Edit Profile</h3>
    <div class="space-y-4">
      <div>
        <Label for="name">Name</Label>
        <Input id="name" type="text" bind:value={editableUser.name} />
      </div>

      <div>
        <Label for="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={editableUser.email}
          readonly
          class="bg-gray-100 cursor-not-allowed"
        />
      </div>


      <div>
        <Label for="bio">Description</Label>
        <textarea
          id="bio"
          rows="3"
          bind:value={editableUser.bio}
          class="w-full rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500 text-gray-800"
        ></textarea>
      </div>

      <div class="flex flex-col items-center space-y-3">
        <Label for="avatar">Profile Picture</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          class="block mb-1 pl-8"
          onchange={async (e) => {
            const input = e.target as HTMLInputElement;
            const file = input?.files?.[0];
            if (file) {
              const formData = new FormData();
              formData.append("avatar", file);
              avatarUploading = true;

              try {
                const res = await fetch("http://localhost:3000/users/upload-avatar", {
                  method: "POST",
                  body: formData,
                });

                if (!res.ok) {
                  const errorText = await res.text();
                  console.error("Upload failed:", errorText);
                  return;
                }

                const contentType = res.headers.get("content-type");
                if (contentType?.includes("application/json")) {
                  const data = await res.json();
                  if (data.url) {
                    editableUser.avatar = data.url;
                    console.log("Avatar set to:", editableUser.avatar);
                  }
                }
              } catch (err) {
                console.error("Upload error:", err);
              } finally {
                avatarUploading = false;
              }

              console.log("New avatar URL:", editableUser.avatar);
            }
          }}
       />
        <p class="text-sm text-gray-500 mt-1">Preview:</p>
        <img
          src={editableUser.avatar}
          alt="Preview"
          class="mt-2 w-24 h-24 rounded-full border-2 border-primary-500 object-cover"
        />
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <Button color="gray" onclick={() => (showEditModal = false)}>Cancel</Button>
      <Button color="primary" onclick={saveProfile} disabled={avatarUploading}>
        {avatarUploading ? 'Uploading Image...' : 'Save'}
      </Button>
    </div>
  </div>
</Modal>

<Modal
  open={showDeleteModal}
  onclose={() => {
    confirmPassword = "";
    deleteErrorMessage = "";
    showDeleteModal = false;
  }}
  class="z-50"
>
  <div class="p-6 space-y-6">
    <h3 class="text-xl font-bold text-red-700">Confirm Account Deletion</h3>
    <p class="text-surface-600">
      Are you sure you want to delete your account? This action is
      <span class="font-bold text-red-600"> irreversible</span>.
    </p>

    <div class="space-y-2">
      <Label for="confirm-password" class="text-surface-700">Enter your password to confirm:</Label>
      <Input
        id="confirm-password"
        type="password"
        bind:value={confirmPassword}
        class={`rounded-md border-2 ${confirmPassword.trim() === "" ? 'border-red-500' : 'border-gray-300'} focus:ring-red-500 focus:border-red-500`}
        placeholder="Your password"
      />
      {#if deleteErrorMessage}
        <p class="text-sm text-red-600">{deleteErrorMessage}</p>
      {/if}
    </div>

    <div class="flex justify-end gap-4 pt-6">
      <Button
        color="gray"
        onclick={() => {
          confirmPassword = "";
          showDeleteModal = false;
        }}
      >
        Cancel
      </Button>
      <Button
        color="red"
        onclick={deleteUser}
        disabled={confirmPassword.trim() === ""}
      >
        Yes, Delete
      </Button>
    </div>
  </div>
</Modal>


{:else}
  <main class="min-h-screen flex items-center justify-center bg-primary-50">
    <p class="text-lg text-gray-500">Loading profile...</p>
  </main>
{/if}
