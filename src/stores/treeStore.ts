import { writable } from "svelte/store";
import type { Node } from "$lib/types";

export const treeStore = writable({
  chosenSocket: null as Node | null,
  allocated: new Map<string, Node>(),
  search: "" as string,
  scale: 0.1,
  hovered: null as Node | null,
  // you can add masteredNotables, ascendancy, etc.
});
