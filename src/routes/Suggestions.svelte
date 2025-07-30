<script lang="ts">
  import { Modal, Button } from "flowbite-svelte";
  // Using correct flowbite-svelte-icons imports

  // Sample reservation data - replace with actual data from your backend
  import { Section, Contact } from 'flowbite-svelte-blocks';
	import { Label, Input, Textarea} from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import Particles from "../lib/components/Particles.svelte";
  import { sendSuggestion } from '../../api/api.js';
  import { getSuggestions } from '../../api/api.js';

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
  let suggestions = $state([]);
  let user = $state({
		first_name: '',
		last_name: '',
		email: '',
		role: '',
		avatar: ''
	});

  onMount(async () => {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      if (token) {
  			const userData = JSON.parse(atob(token.split('.')[1]));
        user = userData;
		
        if (user.role === 'Admin') {
          const data = await getSuggestions();
          suggestions = data.map((s) => ({
            _id: s._id,
            email: s.email,
            subject: s.subject,
            message: s.message,
            createdAt: s.createdAt
          }));
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

  <!--Student can only send suggestions-->
  {#if user.role === 'student'}
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

  <!--Admin can only see all suggestions-->
  {:else if user.role === 'Admin'}
  <div class="min-h-screen bg-offwhite px-4 md:px-32 py-20">
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">All Suggestions</h1>

    {#if suggestions.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each suggestions as s (s._id)}
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm">
            <h2 class="text-xl font-semibold text-primary-600 dark:text-primary-300 mb-2">{s.subject}</h2>
            <p class="text-gray-600 dark:text-gray-300">{s.message}</p>
            <p class="text-sm text-gray-400 mt-4">Submitted by: {s.email}</p>
            <p class="text-sm text-gray-400">At: {new Date(s.createdAt).toLocaleString()}</p>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex items-center justify-center min-h-[900px]">
        <p class="text-center text-gray-500">No suggestions submitted yet.</p>
      </div>
    {/if}
  </div>

  {:else}
    <div class="flex items-center justify-center min-h-[900px]">
      <p class="text-gray-500">Login to submit a suggestion.</p>
    </div>
  {/if}

<div class="-z-10">
    <Particles className="absolute inset-0" refresh={true} color={color} staticity={staticity} quantity={qty}
    size={size} vx={vx} vy={vy}/>
</div>
