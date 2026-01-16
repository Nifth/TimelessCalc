import type { Platform, SearchStore } from "$lib/types";
import { writable } from "svelte/store";

export const defaultLeague = "Keepers";
export const defaultPlatform: Platform = "PC";

export const searchStore = writable<SearchStore>({
  jewelType: null,
  conqueror: null,
  seed: null,
  selectedStats: [],
  searched: false,
  statsResults: {},
  minTotalWeight: 0,
  league: defaultLeague,
  platform: defaultPlatform,
  currentPage: 0,
  totalResults: 0,
  orderedSeeds: [],
  lastTradeInfo: null,
});
