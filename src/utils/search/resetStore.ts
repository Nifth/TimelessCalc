import { searchStore } from "$lib/stores/searchStore";

export function resetDependentFields(): void {
  searchStore.update((s) => {
    s.conqueror = null;
    s.selectedStats = [];
    s.minTotalWeight = 0;
    s.statSearchMode = "occurrences";
    s.searched = false;
    s.statsResults = {};
    s.statKeyColors = {};
    s.orderedSeeds = [];
    s.currentPage = 0;
    s.totalResults = 0;
    s.statsSearched = false;
    s.seedSearched = false;
    return s;
  });
}

export function resetForModeChange(newMode: "seed" | "stats" | null): void {
  searchStore.update((s) => {
    s.mode = newMode;
    s.searched = newMode === "stats" ? false : s.searched;
    s.statsResults = newMode === "stats" ? {} : s.statsResults;
    s.statsSearched = false;
    s.seedSearched = newMode === "seed" ? false : s.seedSearched;
    return s;
  });
}

export function resetFull(): void {
  searchStore.update((s) => {
    s.searched = false;
    s.statsResults = {};
    s.currentPage = 0;
    s.totalResults = 0;
    s.orderedSeeds = [];
    s.statsSearched = false;
    s.seedSearched = false;
    return s;
  });
}
