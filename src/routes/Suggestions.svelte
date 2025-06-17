<script lang="ts">
  import { Card, Button, Badge, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
  // Using correct flowbite-svelte-icons imports
  import { CalendarMonthOutline, ClockOutline, UsersOutline, FlaskOutline, ComputerSpeakerOutline } from "flowbite-svelte-icons";

  // Sample reservation data - replace with actual data from your backend
  import { Section, Contact } from 'flowbite-svelte-blocks';
	import { Label, Input, Textarea} from 'flowbite-svelte';
  import Particles from "../lib/components/Particles.svelte";

  let qty: number = 100;
  let vx: number = 0;
  let vy: number = 0;
  let size: number = 10;
  let staticity: number = 50;
  let color: string = "#908987";  
  let searchTerm = "";



</script>


  <div class="flex flex-row min-h-screen justify-center items-center bg-offwhite">
    <div class="h-auto w-screen md:w-370 bg-opacity-0 z-10">
      
      <div class="mt-10 px-60">
  
      <div class="py-5 bg-primary-50/50 backdrop-blur-xs rounded-md outline-2 outline-tertiary-50/60 outline-dashed w-auto">
  <Section name="contact">
    <Contact h2Class="text-surface-700 flex content-center items-center justify-center" pClass="text-surface-500">
      {#snippet h2()}Send us your suggestions! <img src="/src/assets/teto love.png" class="w-20 rounded-full ml-5" alt="teto">{/snippet}
      {#snippet paragraph()}We highly appreciate any form of feedback{/snippet}
      <form class="space-y-8">
        <div>
          <Label for="email" class="mb-2 block">Your email</Label>
          <Input id="email" name="email" placeholder="name@dlsu.edu.ph" required />
        </div>
        <div>
          <Label for="subject" class="mb-2 block">Subject</Label>
          <Input id="subject" name="subject" placeholder="e.g Home page has accessibility issues" required />
        </div>
        <div>
          <Label for="textarea-id" class="mb-2">Your message</Label>
          <Textarea id="subject" name="subject" placeholder="Describe it here" />
        </div>
        <Button>Send message</Button>
      </form>
    </Contact>
  </Section>
</div>

</div>
</div>
</div>
<div class="-z-10">
    <Particles className="absolute inset-0" refresh={true} color={color} staticity={staticity} quantity={qty}
    size={size} vx={vx} vy={vy}/>
</div>
