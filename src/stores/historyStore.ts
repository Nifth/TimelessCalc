import { writable } from "svelte/store";
import type {
  SearchHistoryEntry,
  Node as TreeNode,
} from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import { treeStore } from "$lib/stores/treeStore";
import { get } from "svelte/store";
import {
  updateAllocatedDisplay,
  updateSocketVisualSelection,
} from "$lib/konva/utils/jewelHighlight";
import { jewelTypes, conquerors } from "$lib/constants/timeless";
import { canvas } from "$lib/konva/canvasContext";

const HISTORY_KEY = "timelessCalc_searchHistory";
const MAX_HISTORY_ENTRIES = 10;

// Load history from localStorage
function loadHistory(): SearchHistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn("Failed to load search history from localStorage:", e);
    return [];
  }
}

// Save history to localStorage
function saveHistory(history: SearchHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn("Failed to save search history to localStorage:", e);
  }
}

export const historyStore = writable<SearchHistoryEntry[]>(loadHistory());

// Subscribe to changes and save to localStorage
historyStore.subscribe(saveHistory);

export const historyActions = {
  // Save current search configuration to history
  saveCurrentSearch(): void {
    const currentSearchStore = get(searchStore);
    const currentTreeStore = get(treeStore);

    console.log(
      "Saving search - allocated nodes:",
      currentTreeStore.allocated.size,
    );

    // Only save if we have required data
    if (
      !currentTreeStore.chosenSocket ||
      !currentSearchStore.jewelType ||
      !currentSearchStore.conqueror
    ) {
      return;
    }

    const allocatedSkillIds = Array.from(currentTreeStore.allocated.keys());

    const entry: SearchHistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      socket: currentTreeStore.chosenSocket,
      jewelType: currentSearchStore.jewelType,
      conqueror: currentSearchStore.conqueror,
      stats: [...currentSearchStore.selectedStats],
      minTotalWeight: currentSearchStore.minTotalWeight,
      allocatedSkillIds,
    };

    console.log(
      "Entry allocated skill IDs:",
      allocatedSkillIds.length,
      allocatedSkillIds,
    );

    historyStore.update((history) => {
      // Add new entry at the beginning and limit to MAX_HISTORY_ENTRIES
      const newHistory = [entry, ...history.slice(0, MAX_HISTORY_ENTRIES - 1)];
      return newHistory;
    });
  },

  // Load a search configuration from history
  loadSearch(entry: SearchHistoryEntry): void {
    // Find the correct object references from constants to ensure proper binding
    const jewelType =
      jewelTypes.find((jt) => jt.name === entry.jewelType.name) ||
      entry.jewelType;
    const conquerorOptions = jewelType ? conquerors[jewelType.name] || [] : [];
    const conqueror =
      conquerorOptions.find((c) => c.id === entry.conqueror?.id) ||
      entry.conqueror;

    // Update search store
    searchStore.update((store) => ({
      ...store,
      jewelType,
      conqueror,
      selectedStats: [...entry.stats],
      minTotalWeight: entry.minTotalWeight,
      mode: "stats",
      searched: false, // Will be set to true when search executes
      statsResults: {},
      currentPage: 0,
      totalResults: 0,
      orderedSeeds: [],
      statsSearched: false,
    }));

    // Update tree store socket and allocated nodes
    treeStore.update((store) => {
      // Reconstruct allocated Map from skill IDs using real node data
      const allocated = new Map<string, TreeNode>();
      const nodes = canvas.treeData.nodes;

      for (const skillId of entry.allocatedSkillIds || []) {
        const node = nodes[skillId];
        if (node) {
          allocated.set(skillId, node);
        }
      }

      return {
        ...store,
        chosenSocket: entry.socket,
        allocated,
      };
    });

    // Update visual display of jewel sockets (selected state)
    updateSocketVisualSelection();

    // Update visual display of allocated nodes
    updateAllocatedDisplay();
  },

  // Delete a history entry
  deleteEntry(id: string): void {
    historyStore.update((history) =>
      history.filter((entry) => entry.id !== id),
    );
  },

  // Check if current search has any configuration
  hasCurrentConfiguration(): boolean {
    const currentSearchStore = get(searchStore);
    const currentTreeStore = get(treeStore);

    return !!(
      currentTreeStore.chosenSocket ||
      currentSearchStore.jewelType ||
      currentSearchStore.conqueror ||
      currentSearchStore.selectedStats.length > 0
    );
  },

  // Clear all history
  clearHistory(): void {
    historyStore.set([]);
  },
};
