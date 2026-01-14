import type { Conqueror, JewelType, League, Stat } from "$lib/types";
import { writable } from "svelte/store";

export const defaultLeague = "Keepers";

export const searchStore = writable({
  jewelType: null as JewelType | null,
  conqueror: null as Conqueror | null,
  seed: null as number | null,
  selectedStats: [] as Stat[],
  searched: false as boolean,
  statsResults: {} as Record<
    string,
    { seed: number; statCounts: Record<number, number>; totalWeight: number }[]
  >,
  minTotalWeight: 0 as number,
  league: defaultLeague as League["name"],
});
