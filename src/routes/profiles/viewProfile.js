import { mount } from 'svelte'
import '../../app.css'
import LoginInt from "./Profile.svelte"

const app = mount(LoginInt, {
  target: document.getElementById('app'),
})

export default app
