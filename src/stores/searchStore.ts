import type { Conqueror, JewelType } from '$lib/types';
import { writable } from 'svelte/store';

export const searchStore = writable({
  jewelType: null as JewelType | null,
  conqueror: null as Conqueror | null,
  seed: null as number | null,
  scale: 0.1,
  hovered: null as Node | null,
  // tu pourras ajouter masteredNotables, ascendancy, etc.
});