import type { Platform, SearchStore, JewelType } from "$lib/types";
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
  statKeyColors: {},
  minTotalWeight: 0,
  league: defaultLeague,
  platform: defaultPlatform,
  currentPage: 0,
  totalResults: 0,
  orderedSeeds: [],
  lastTradeInfo: null,
  loading: false,
  mode: null,
  statsSearched: false,
  seedSearched: false,
  automated: false,
  jewelLoadError: null,
});

export { resetDependentFields } from "$lib/utils/search/resetStore";

export function setJewelLoadError(jewel: JewelType, message: string) {
  searchStore.update((s) => ({ ...s, jewelLoadError: { jewel, message } }));
}

export function clearJewelLoadError() {
  searchStore.update((s) => ({ ...s, jewelLoadError: null }));
}
