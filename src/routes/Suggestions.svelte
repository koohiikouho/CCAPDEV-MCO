<script lang="ts">
  import { Modal, Button } from "flowbite-svelte";
  // Using correct flowbite-svelte-icons imports

  // Sample reservation data - replace with actual data from your backend
  import { Section, Contact } from 'flowbite-svelte-blocks';
	import { Label, Input, Textarea} from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import Particles from "../lib/components/Particles.svelte";
  import { sendSuggestion } from '../../api/api.js';

  let qty: number = 100;
  let vx: number = 0;
  let vy: number = 0;
  let size: number = 10;
  let staticity: number = 50;
  let color: string = "#908987";  
  let searchTerm = "";
  let defaultModal = $state(false);

  let message = $state("");
  let subject = $state("");
  let user = {
		first_name: '',
		last_name: '',
		email: '',
		role: '',
		avatar: ''
	};

  onMount(async () => {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      if (token) {
        console.log('Token found:', token);
        try {
          const response = await fetch('http://localhost:3000/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user info");
          }

          const userData = await response.json();
          user = userData;
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    });

    async function handleSuggestion(e: Event) {
		  e.preventDefault();
      
      try {
        const data = await sendSuggestion(user.email, subject, message);
        defaultModal = true;
        console.log('Suggestion sent successfully');
        message = "";
        subject = "";
        
      } catch (err) {
        console.error("Suggestion sending failed:", err);
      }
	}
</script>


  <div class="flex flex-row min-h-screen justify-center items-center bg-offwhite">
    <div class="h-auto w-screen md:w-370 bg-opacity-0 z-10">
      
      <div class="mt-10 px-0 md:px-60">
  
      <div class="py-5 bg-primary-50/50 backdrop-blur-xs rounded-md outline-2 outline-tertiary-50/60 outline-dashed w-auto">
      <Section name="contact">
        <Contact h2Class="text-surface-700 flex content-center items-center justify-center" pClass="text-surface-500">
          {#snippet h2()}Send us your suggestions! <img src="/src/assets/teto love.png" class="w-20 rounded-full ml-2 md:ml-5" alt="teto">{/snippet}
          {#snippet paragraph()}We highly appreciate any form of feedback{/snippet}
          <form class="space-y-8" onsubmit={handleSuggestion}>
            <div>
              <Label for="subject" class="mb-2 block">Subject</Label>
              <Input id="subject" name="subject" placeholder="e.g Home page has accessibility issues" bind:value={subject} required />
            </div>
            <div>
              <Label for="textarea-id" class="mb-2">Your message</Label>
              <Textarea id="message" name="message" placeholder="Describe it here" bind:value={message} required/>
            </div>
            <Button type="submit">Send message</Button>
          </form>
        </Contact>
      </Section>
    </div>

    <Modal bind:open={defaultModal} autoclose class="backdrop-blur-sm border-2 border-green-300 rounded-xl px-8 py-10 bg-white dark:bg-gray-900 shadow-md flex flex-col items-center space-y-5 text-center">
      
      <img src="/src/assets/logo.png" alt="Lab Club Logo" class="w-24 h-auto" />

      <h1 class="text-4xl font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent dark:from-white dark:to-green-300">
        Suggestion Sent!
      </h1>

      <p class="text-gray-700 dark:text-gray-300 text-base">
        Thank you for your feedback. We’ve received your suggestion and will<br/>
        review it as soon as possible.
      </p>

      <button onclick={() => (defaultModal = false)} class="px-6 py-2 text-white font-medium rounded-full text-lg shadow-sm bg-green-500 hover:bg-green-600 transition-all">
        Close
      </button>
    </Modal>


    </div>
  </div>
</div>
<div class="-z-10">
    <Particles className="absolute inset-0" refresh={true} color={color} staticity={staticity} quantity={qty}
    size={size} vx={vx} vy={vy}/>
</div>
