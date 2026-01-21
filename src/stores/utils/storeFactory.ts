import { writable, type Writable } from "svelte/store";
import type { BaseEntry } from "$lib/stores/utils/storeUtils";
import { createLocalStorageManager, hasCurrentConfiguration as checkCurrentConfiguration, loadConfiguration } from "$lib/stores/utils/storeUtils";

export interface StoreFactoryConfig<T extends BaseEntry, TActions> {
  storageKey: string;
  initialActions: Omit<TActions, keyof BaseStoreActions<T>>;
}

export interface BaseStoreActions<T extends BaseEntry> {
  createEntry(entry: T): void;
  getEntry(id: string): T | undefined;
  updateEntry(id: string, updater: (entry: T) => T): void;
  deleteEntry(id: string): void;
  hasCurrentConfiguration(): boolean;
  exists(id: string): boolean;
}

export function createPersistedStore<T extends BaseEntry, TActions extends BaseStoreActions<T>>(
  config: StoreFactoryConfig<T, TActions>,
): { store: Writable<T[]>; actions: TActions } {
  const { storageKey, initialActions } = config;
  const { load, save } = createLocalStorageManager<T>(storageKey);

  const store = writable<T[]>(load());

  store.subscribe(save);

  const actions = {
    ...initialActions,
    createEntry(entry: T): void {
      store.update((entries) => [entry, ...entries]);
    },

    getEntry(id: string): T | undefined {
      let entries: T[] = [];
      store.subscribe((value) => entries = value)();
      return entries.find((entry) => entry.id === id);
    },

    updateEntry(id: string, updater: (entry: T) => T): void {
      store.update((entries) =>
        entries.map((entry) => (entry.id === id ? updater(entry) : entry)),
      );
    },

    deleteEntry(id: string): void {
      store.update((entries) => entries.filter((entry) => entry.id !== id));
    },

    hasCurrentConfiguration(): boolean {
      return checkCurrentConfiguration();
    },

    exists(id: string): boolean {
      let entries: T[] = [];
      store.subscribe((value) => entries = value)();
      return entries.some((entry) => entry.id === id);
    },
  } as TActions;

  return { store, actions };
}
