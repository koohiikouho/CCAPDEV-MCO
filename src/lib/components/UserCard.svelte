<script lang="ts">
  import { Card, Dropdown, DropdownItem, Avatar, Button } from "flowbite-svelte";
  import { DotsHorizontalOutline } from "flowbite-svelte-icons";


  let { name, email, avatar, open = $bindable(false) }: { name: string; email: string; avatar: string, open} = $props();

  // Avatar URL fallback if no avatar provided
  let avatarSrc = $derived(avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`);


</script>

<Card class="p-4 sm:p-5 md:p-7 min-w-100">
  <div class="flex justify-end">
  </div>
  <div class="flex flex-col items-center pb-4">
    <Avatar size="lg" src={avatarSrc} />
    <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">{name}</h5>
    <span class="text-sm text-gray-500 dark:text-gray-400">{email}</span>
    <div class="mt-4 flex space-x-3 lg:mt-6 rtl:space-x-reverse">
      <Button >View profile</Button>
    </div>
  </div>
</Card>
