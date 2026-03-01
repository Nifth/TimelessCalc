import { searchStore } from "$lib/stores/searchStore";
import { canvas } from "$lib/canvas/canvasContext";
import type { Node } from "$lib/types";

export function resetHighlights(): void {
	canvas.state.highlightedStatKeys = null;
	canvas.state.highlightVersion++;
}

export function changeRadius(_chosenSocket: Node | null): void {
	// Radius change logic - currently a no-op placeholder
	canvas.state.highlightVersion++;
}

export function changeKeystone(_chosenSocket: Node | null): void {
	// Keystone change logic - currently a no-op placeholder
	canvas.state.highlightVersion++;
}

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
