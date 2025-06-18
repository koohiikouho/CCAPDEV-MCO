<script lang="ts">
  import {
    Avatar,
    Button,
    Modal,
    Input,
    Label,
    Badge,
    Card,
  } from "flowbite-svelte";

  import {
    CalendarMonthOutline,
    ClockOutline,
    UsersOutline,
    FlaskOutline,
    ComputerSpeakerOutline,
  } from "flowbite-svelte-icons";
  import TempNavbar from "../../lib/components/TempNavbar.svelte";

  let params = new URLSearchParams(location.search);
  let userCode: string = params.get("userCode");

  let reservations = [
    {
      id: 1,
      labName: "GK 211 Laboratory",
      date: "2024-06-20",
      time: "2:00 PM - 4:00 PM",
      duration: "2 hours",
      purpose: "Web Development Project",
      status: "Confirmed",
      seat: "C3",
    },
    {
      id: 2,
      labName: "GK 403 Network Laboratory",
      date: "2024-06-22",
      time: "10:00 AM - 12:00 PM",
      duration: "2 hours",
      purpose: "LBYITN4 Networking Activity",
      status: "Ongoing",
      seat: "C1",
    },
    {
      id: 3,
      labName: "AG 1703 Laboratory",
      date: "2024-06-18",
      time: "3:00 PM - 5:00 PM",
      duration: "2 hours",
      purpose: "CCAPDEV MC01 Presentation",
      status: "Completed",
      seat: "B5",
    },
    {
      id: 4,
      labName: "AG 1707 Laboratory",
      date: "2024-06-18",
      time: "3:00 PM - 8:30 PM",
      duration: "5.5 hours",
      purpose: "CCAPDEV MC01 Presentation",
      status: "Cancelled",
      seat: "A4",
    },
  ];

  function getStatusColor(status) {
    switch (status) {
      case "Confirmed":
        return "green";
      case "Ongoing":
        return "yellow";
      case "Completed":
        return "blue";
      case "Cancelled":
        return "red";
      default:
        return "gray";
    }
  }

  // Current user is Kasane Teto (custom)
  let currentUser = {
    name: "Kasane Teto",
    email: "kasaneteto@dlsu.edu.ph",
    avatar: "/src/assets/profilepic.jpg",
    role: "Lab Assistant",
    description:
      "I'm passionate about technology and creative research. I assist with lab experiments, manage reservations, and support members in the lab.",
  };

  let constUser = {
    name: "Kasane Teto",
    email: "kasaneteto@dlsu.edu.ph",
    avatar: "/src/assets/profilepic.jpg",
    role: "Lab Assistant",
    description:
      "I'm passionate about technology and creative research. I assist with lab experiments, manage reservations, and support members in the lab.",
  };
  if (userCode === "1") {
    currentUser = {
      name: "Ron Alonzo",
      email: "ron_alonzo@dlsu.edu.ph",
      avatar: "/src/assets/Users/ronPfp.png",
      role: "Student",
      description:
        "I'm a student exploring different technologies and working on lab projects.",
    };
  } else if (userCode === "2") {
    currentUser = {
      name: "Joshua Gonzales",
      email: "joshua_gonzales@dlsu.edu.ph",
      avatar: "/src/assets/Users/joshuaPfp.png",
      role: "Student",
      description:
        "I enjoy learning about networks, systems, and how things connect behind the scenes.",
    };
  } else if (userCode === "3") {
    currentUser = {
      name: "Nathaniel Reyes",
      email: "nathaniel_reyes@dlsu.edu.ph",
      avatar: "/src/assets/Users/alden.jpeg",
      role: "Student",
      description: "Always curious about system performance and backend logic.",
    };
  } else if (userCode === "4") {
    currentUser = {
      name: "Cochise King",
      email: "cochise_king@dlsu.edu.ph",
      avatar: "/src/assets/Users/cochisePfp.png",
      role: "Professor",
      description:
        "I teach and guide students in the field of computer science and software engineering.",
    };
  }

  // fallback avatar
  function getAvatar(avatar: string): string {
    return avatar && avatar !== "" ? avatar : "/default-avatar.png";
  }

  let showEditModal = false;

  function openEditModal() {
    showEditModal = true;
  }

  function saveProfile() {
    // For now, just log the updated values (you can connect this to a backend or store)
    console.log("Updated Profile:", currentUser);
    showEditModal = false;
  }

  // Extract `profile` query param from URL
  const urlParams = new URLSearchParams(window.location.search);
  const profileParam = urlParams.get("profile");

  // If profileParam is null or "0", show edit; if "1", it's another user's profile
  let isOwnProfile = profileParam !== "1";
</script>

<TempNavbar
  userName={constUser.name}
  userEmail={constUser.email}
  profilePicture={constUser.avatar}
/>

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
          class="w-70 h-70 rounded-full ring-4 ring-primary-500 shadow-lg"
        />
      </div>

      <!-- Info -->
      <div class="md:col-span-2 space-y-4">
        <h1 class="text-4xl font-bold text-primary-900">{currentUser.name}</h1>
        <p class="text-lg text-primary-700">{currentUser.email}</p>
        <Badge class="text-sm px-3 py-1">{currentUser.role}</Badge>

        <div class="mt-6">
          <h2 class="text-xl font-semibold text-surface-700 mb-2">About</h2>
          <p class="text-surface-600">{currentUser.description}</p>
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
          {#each reservations as reservation (reservation.id)}
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
          {/each}
        </div>
      {:else}
        <Card
          class="text-center py-12 border border-surface-200 bg-surface-50 mt-10"
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
        <Input id="email" type="email" bind:value={currentUser.email} />
      </div>

      <div>
        <Label for="description" class="block mb-1">Description</Label>
        <textarea
          id="description"
          rows="3"
          bind:value={currentUser.description}
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
