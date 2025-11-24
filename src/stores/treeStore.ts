import { writable } from 'svelte/store';
import type { Node } from '$lib/types';

export const treeStore = writable({
  chosenSocket: null as Node | null,
  allocated: new Map<string, number>(),
  search: '' as string,
  scale: 0.1,
  hovered: null as Node | null,
  // tu pourras ajouter masteredNotables, ascendancy, etc.
});