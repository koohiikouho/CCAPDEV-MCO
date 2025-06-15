<script lang="ts">
  import { Card, Dropdown, DropdownItem, Avatar, Button } from "flowbite-svelte";
  import { DotsHorizontalOutline } from "flowbite-svelte-icons";


  let { name, email, avatar, role }: { name: string; email: string; avatar: string; role: string;} = $props();

  // Avatar URL fallback if no avatar provided
  let avatarSrc = $derived(avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`);

</script>

<Card href="" class="p-4 sm:p-5 md:p-7 min-w-100 bg-primary-300/50 hover:bg-primary-200 shadow-none transition-shadow duration-100 cursor-pointer hover:shadow-lg hover:shadow-secondary-200/50">
  <div class="flex justify-end">
  </div>
  <div class="flex flex-col items-center pb-4">
    <Avatar size="lg" src={avatarSrc} />
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-offwhite dark:text-white">{name}</h5>
    <span class="mb-3 leading-tight font-normal text-offwhite/80 dark:text-gray-400">{email}</span>
    <span class="mb-3 leading-tight font-normal text-offwhite/80 dark:text-gray-400">{role}</span>
    <div class="mt-4 flex space-x-3 lg:mt-6 rtl:space-x-reverse">
    </div>
  </div>
</Card>
