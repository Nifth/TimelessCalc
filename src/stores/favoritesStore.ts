import { writable } from "svelte/store";
import type { FavoriteEntry } from "$lib/types";
import { createLocalStorageManager, hasCurrentConfiguration as checkCurrentConfiguration, loadConfiguration, createBaseEntry } from "$lib/stores/utils/storeUtils";

const FAVORITES_KEY = "timelessCalc_favorites";
const { load: loadFavorites, save: saveFavorites } = createLocalStorageManager<FavoriteEntry>(FAVORITES_KEY);

export const favoritesStore = writable<FavoriteEntry[]>(loadFavorites());

// Subscribe to changes and save to localStorage
favoritesStore.subscribe(saveFavorites);

export const favoritesActions = {
  // Save current search configuration as favorite with name
  saveFavorite(name: string): void {
    const baseEntry = createBaseEntry();
    if (!baseEntry) return;

    const entry: FavoriteEntry = {
      ...baseEntry,
      name,
    };

    favoritesStore.update((favorites) => [entry, ...favorites]);
  },

  // Load a favorite configuration
  loadFavorite(entry: FavoriteEntry): void {
    loadConfiguration(entry);
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
    return checkCurrentConfiguration();
  },

  // Check if a favorite with the given id exists
  exists(id: string): boolean {
    let favorites: FavoriteEntry[] = [];
    favoritesStore.subscribe((value) => favorites = value)();
    return favorites.some((entry) => entry.id === id);
  },
};
