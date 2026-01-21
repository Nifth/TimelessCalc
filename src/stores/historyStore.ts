import { writable } from "svelte/store";
import type { SearchHistoryEntry } from "$lib/types";
import { createLocalStorageManager, hasCurrentConfiguration as checkCurrentConfiguration, loadConfiguration, createBaseEntry } from "$lib/stores/utils/storeUtils";

const HISTORY_KEY = "timelessCalc_searchHistory";
const MAX_HISTORY_ENTRIES = 10;
const { load: loadHistory, save: saveHistory } = createLocalStorageManager<SearchHistoryEntry>(HISTORY_KEY);

export const historyStore = writable<SearchHistoryEntry[]>(loadHistory());

// Subscribe to changes and save to localStorage
historyStore.subscribe(saveHistory);

export const historyActions = {
  // Save current search configuration to history
  saveCurrentSearch(): void {
    const baseEntry = createBaseEntry();
    if (!baseEntry) return;

    const entry: SearchHistoryEntry = baseEntry;

    historyStore.update((history) => {
      // Add new entry at the beginning and limit to MAX_HISTORY_ENTRIES
      const newHistory = [entry, ...history.slice(0, MAX_HISTORY_ENTRIES - 1)];
      return newHistory;
    });
  },

  // Load a search configuration from history
  loadSearch(entry: SearchHistoryEntry): void {
    loadConfiguration(entry);
  },

  // Delete a history entry
  deleteEntry(id: string): void {
    historyStore.update((history) =>
      history.filter((entry) => entry.id !== id),
    );
  },

  // Check if current search has any configuration
  hasCurrentConfiguration(): boolean {
    return checkCurrentConfiguration();
  },

  // Clear all history
  clearHistory(): void {
    historyStore.set([]);
  },
};
