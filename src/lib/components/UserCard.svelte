<script lang="ts">
  import { Card, Dropdown, DropdownItem, Avatar, Button } from "flowbite-svelte";
  import { DotsHorizontalOutline } from "flowbite-svelte-icons";


  let { name, email, avatar, role }: { name: string; email: string; avatar: string; role: string;} = $props();

  // Avatar URL fallback if no avatar provided
  let avatarSrc = $derived(avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`);

</script>

<Card href="" class="min-w-60 bg-secondary-50/30 rounded-lg hover:opacity-80 hover:scale-110 hover:border-[0.5px] hover:border-secondary-600 transition-transform shadow-none duration-100 cursor-pointer hover:shadow-lg hover:shadow-secondary-200/50
    backdrop-blur-md  text-start">
  <div class="flex justify-end">
  </div>
  <div class="flex flex-col items-center pb-4 pt-2">
    <Avatar size="lg" src={avatarSrc} />
      <h5 class="mb-2 text-2xl tracking-tight text-surface-500 dark:text-white font-medium">{name}</h5>
      <span class="mb-3 text-xs tracking-tight text-surface-400 dark:text-gray-400 font-normal">{email}</span>
      <span class="text-xs tracking-tight text-surface-400 dark:text-gray-400 font-normal">{role}</span>
  </div>
</Card>
