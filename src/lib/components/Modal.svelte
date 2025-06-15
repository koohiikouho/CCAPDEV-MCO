<script>
  import { Button, Modal, P } from "flowbite-svelte";
  let { open = $bindable(false) } = $props();
</script>

<Modal title="Ron Alonzo" bind:open autoclose>
  <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">ron_alonzo@gmail.com</p>
  <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Student</p>
  <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">123</p>
  <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">BS Information Technology</p>
  <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Active Bookings: <br> - G304B <br> - V102</p>
</Modal>