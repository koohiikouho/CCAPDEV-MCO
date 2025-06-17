import { mount } from 'svelte'
import '../../app.css'
import LoginInt from "./SignUp.svelte"

const app = mount(LoginInt, {
  target: document.getElementById('app'),
})

export default app
