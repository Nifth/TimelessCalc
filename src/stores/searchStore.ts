import type { Conqueror, JewelType, Stat } from "$lib/types";
import { writable } from "svelte/store";

export const searchStore = writable({
  jewelType: null as JewelType | null,
  conqueror: null as Conqueror | null,
  seed: null as number | null,
  selectedStats: [] as Stat[],
});
