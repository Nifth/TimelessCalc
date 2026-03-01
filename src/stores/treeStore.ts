import { writable } from "svelte/store";
import type { Node } from "$lib/types";

export const treeStore = writable({
	chosenSocket: null as Node | null,
	allocated: new Map<string, Node>(),
	search: "" as string,
	scale: 10,
	hovered: null as Node | null,
	loading: false,
});
