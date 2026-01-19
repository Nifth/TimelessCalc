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
  loading: false,
  mode: null,
  statsSearched: false,
  seedSearched: false,
  automated: false,
});

/**
 * Resets fields that depend on jewelType selection.
 * Called when jewelType changes since conqueror/stats differ per jewel type.
 */
export function resetDependentFields() {
  searchStore.update((s) => ({
    ...s,
    conqueror: null,
    selectedStats: [],
    minTotalWeight: 0,
    searched: false,
    statsResults: {},
    orderedSeeds: [],
    currentPage: 0,
    totalResults: 0,
    statsSearched: false,
    seedSearched: false,
  }));
}
