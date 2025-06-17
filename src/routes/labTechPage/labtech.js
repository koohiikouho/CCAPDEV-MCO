import { mount } from "svelte";
import "../../app.css";
import AdminPage from "./labtech.svelte";

const app = mount(AdminPage, {
  target: document.getElementById("app"),
});

export default app;
