import { searchStore } from "$lib/stores/searchStore";

export function resetDependentFields(): void {
  searchStore.update((s) => ({
    ...s,
    conqueror: null,
    selectedStats: [],
    minTotalWeight: 0,
    statSearchMode: "occurrences",
    searched: false,
    statsResults: {},
    statKeyColors: {},
    orderedSeeds: [],
    currentPage: 0,
    totalResults: 0,
    statsSearched: false,
    seedSearched: false,
  }));
}

export function resetForModeChange(newMode: "seed" | "stats" | null): void {
  searchStore.update((s) => ({
    ...s,
    mode: newMode,
    searched: newMode === "stats" ? false : s.searched,
    statsResults: newMode === "stats" ? {} : s.statsResults,
    statsSearched: false,
    seedSearched: newMode === "seed" ? false : s.seedSearched,
  }));
}

export function resetFull(): void {
  searchStore.update((s) => ({
    ...s,
    searched: false,
    statsResults: {},
    currentPage: 0,
    totalResults: 0,
    orderedSeeds: [],
    statsSearched: false,
    seedSearched: false,
  }));
}
