import type { FavoriteEntry } from "$lib/types";
import {
  createPersistedStore,
  type BaseStoreActions,
} from "$lib/stores/utils/storeFactory";
import {
  loadConfiguration,
  createBaseEntry,
} from "$lib/stores/utils/storeUtils";

const FAVORITES_KEY = "timelessCalc_favorites";

interface FavoritesExtraActions {
  saveFavorite(name: string): void;
  loadFavorite(entry: FavoriteEntry): void;
  updateName(id: string, newName: string): void;
  deleteFavorite(id: string): void;
}

export const { store: favoritesStore, actions: favoritesActions } =
  createPersistedStore<
    FavoriteEntry,
    BaseStoreActions<FavoriteEntry> & FavoritesExtraActions
  >({
    storageKey: FAVORITES_KEY,
    initialActions: (baseActions) => ({
      saveFavorite(name: string): void {
        const baseEntry = createBaseEntry();
        if (!baseEntry) return;

        const entry: FavoriteEntry = {
          ...baseEntry,
          name,
        };

        baseActions.createEntry(entry);
      },

      loadFavorite(entry: FavoriteEntry): void {
        loadConfiguration(entry);
      },

      updateName(id: string, newName: string): void {
        baseActions.updateEntry(id, (entry: FavoriteEntry) => ({
          ...entry,
          name: newName,
        }));
      },

      deleteFavorite(id: string): void {
        baseActions.deleteEntry(id);
      },
    }),
  });
