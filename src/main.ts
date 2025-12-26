import { mount } from "svelte";
import "./app.css";
import Tree from "./Tree.svelte";

const app = mount(Tree, {
  target: document.getElementById("app")!,
});

export default app;
