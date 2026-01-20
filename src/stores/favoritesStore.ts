import { writable } from "svelte/store";
import type { FavoriteEntry, TreeData, Node as TreeNode } from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import { treeStore } from "$lib/stores/treeStore";
import { get } from "svelte/store";
import {
  updateAllocatedDisplay,
  updateSocketVisualSelection,
} from "$lib/konva/utils/jewelHighlight";
import treeData from "$lib/data/tree.json" with { type: "json" };
import { jewelTypes, conquerors } from "$lib/constants/timeless";

const FAVORITES_KEY = "timelessCalc_favorites";

// Load favorites from localStorage
function loadFavorites(): FavoriteEntry[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn("Failed to load favorites from localStorage:", e);
    return [];
  }
}

// Save favorites to localStorage
function saveFavorites(favorites: FavoriteEntry[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.warn("Failed to save favorites to localStorage:", e);
  }
}

export const favoritesStore = writable<FavoriteEntry[]>(loadFavorites());

// Subscribe to changes and save to localStorage
favoritesStore.subscribe(saveFavorites);

export const favoritesActions = {
  // Save current search configuration as favorite with name
  saveFavorite(name: string): void {
    const currentSearchStore = get(searchStore);
    const currentTreeStore = get(treeStore);

    console.log(
      "Saving favorite - allocated nodes:",
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

    const entry: FavoriteEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      socket: currentTreeStore.chosenSocket,
      jewelType: currentSearchStore.jewelType,
      conqueror: currentSearchStore.conqueror,
      stats: [...currentSearchStore.selectedStats],
      minTotalWeight: currentSearchStore.minTotalWeight,
      allocatedSkillIds,
      name,
    };

    console.log(
      "Favorite entry allocated skill IDs:",
      allocatedSkillIds.length,
      allocatedSkillIds,
    );

    favoritesStore.update((favorites) => [entry, ...favorites]);
  },

  // Load a favorite configuration
  loadFavorite(entry: FavoriteEntry): void {
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
      const nodes = (treeData as unknown as TreeData).nodes;

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

  // Delete a favorite entry
  deleteFavorite(id: string): void {
    favoritesStore.update((favorites) =>
      favorites.filter((entry) => entry.id !== id),
    );
  },

  // Update the name of a favorite
  updateName(id: string, newName: string): void {
    favoritesStore.update((favorites) =>
      favorites.map((entry) =>
        entry.id === id ? { ...entry, name: newName } : entry,
      ),
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

  // Check if a favorite with the given id exists
  exists(id: string): boolean {
    const favorites = get(favoritesStore);
    return favorites.some((entry) => entry.id === id);
  },
};
