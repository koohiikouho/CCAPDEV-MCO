<script lang="ts">
  import {
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Avatar,
    Dropdown,
    DropdownHeader,
    DropdownItem,
    DropdownGroup,
    Button,
    Modal,
    Input,
    Label,
    Select,
    Badge,
    Textarea,
  } from "flowbite-svelte";

  // All users
  const users = [
    {
      id: 1,
      name: "Ron Alonzo",
      email: "ron_alonzo@dlsu.edu.ph",
      avatar: "/profilepic.jpg", // should be in /static
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
      avatar: "/Users/alden.jpeg", // static path
      role: "Student"
    },
    {
      id: 4,
      name: "Cochise King",
      email: "cochise_king@dlsu.edu.ph",
      avatar: "",
      role: "Professor"
    }
  ];

  // Current user is Kasane Teto (custom)
  let currentUser = {
    name: "Kasane Teto",
    email: "kasaneteto@utau.com",
    avatar: "/src/assets/profilepic.jpg", // using Ron Alonzo's image
    role: "Lab Assistant",
    description: "I'm passionate about technology and creative research. I assist with lab experiments, manage reservations, and support members in the lab."
  };

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
</script>

<header>
  <Navbar class="p-0 fixed start-0 top-0 z-20 bg-white/30 hover:bg-surface-50/60 transition backdrop-blur-xl shadow-md">
    <NavBrand href="/">
      <img src="/src/assets/logolite.png" class="me-3 h-6 sm:h-9 object-fill" alt="Lab Club Logo" />
      <span class="self-center text-xl font-semibold whitespace-nowrap text-surface-400">Lab Club!</span>
    </NavBrand>
    <NavHamburger />
    <NavUl>
      <NavLi href="/index.html?view=1" class="text-surface-400">Labs</NavLi>
      <NavLi href="/index.html?view=2" class="text-surface-400">Users</NavLi>
      <NavLi href="#" class="text-surface-400">About</NavLi>
      <Avatar id="user-drop" src={getAvatar(currentUser.avatar)} class="cursor-pointer ml-5" />
      <Dropdown triggeredBy="#user-drop" class="mt-5 bg-primary-200">
        <DropdownHeader>
          <span class="block text-sm text-white">{currentUser.name}</span>
          <span class="block truncate text-sm font-medium text-white">{currentUser.email}</span>
        </DropdownHeader>
        <DropdownGroup class="text-white">
          <DropdownItem>Profile</DropdownItem>
          <DropdownItem>Reservations</DropdownItem>
        </DropdownGroup>
        <DropdownGroup class="text-white">
          <DropdownItem>Sign out</DropdownItem>
        </DropdownGroup>
      </Dropdown>
    </NavUl>
  </Navbar>
</header>

<main class="mt-28 p-10 sm:p-20 bg-primary-50 min-h-screen text-surface-800">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto bg-white p-10 rounded-xl shadow-2xl">
    <!-- Avatar -->
    <div class="flex justify-center">

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
        <p class="text-surface-600">
          I'm passionate about technology and creative research. I assist with lab experiments, manage reservations, and support members in the lab.
        </p>
      </div>

      <div class="mt-8 flex gap-4">
        <Button color="primary" onclick={openEditModal}>Edit Profile</Button>
      </div>
    </div>
  </div>
</main>


<Modal open={showEditModal} onclose={() => (showEditModal = false)} class="z-50">
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
        <Label for="role" class="block mb-1">Role</Label>
        <Select id="role" bind:value={currentUser.role}>
          <option>Student</option>
          <option>Professor</option>
          <option>Lab Assistant</option>
        </Select>
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

    <div class="flex justify-end gap-2 pt-4">
      <Button color="gray" onclick={() => (showEditModal = false)}>Cancel</Button>
      <Button color="primary" onclick={saveProfile}>Save</Button>
    </div>
  </div>
</Modal>




