import { mount } from 'svelte'
import '../../app.css'
import LabRoom from './LabRoom.svelte'

const app = mount(LabRoom, {
  target: document.getElementById('app'),
})

export default app
