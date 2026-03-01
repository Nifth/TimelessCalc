import { writable, get, type Writable } from "svelte/store";
import type { BaseEntry } from "$lib/stores/utils/storeUtils";
import {
	createLocalStorageManager,
	hasCurrentConfiguration as checkCurrentConfiguration,
} from "$lib/stores/utils/storeUtils";

export interface StoreFactoryConfig<T extends BaseEntry, TActions> {
	storageKey: string;
	initialActions: (
		baseActions: BaseStoreActions<T>,
	) => Omit<TActions, keyof BaseStoreActions<T>>;
}

export interface BaseStoreActions<T extends BaseEntry> {
	createEntry(entry: T): void;
	getEntry(id: string): T | undefined;
	updateEntry(id: string, updater: (entry: T) => T): void;
	deleteEntry(id: string): void;
	hasCurrentConfiguration(): boolean;
	exists(id: string): boolean;
}

export function createPersistedStore<
	T extends BaseEntry,
	TActions extends BaseStoreActions<T>,
>(
	config: StoreFactoryConfig<T, TActions>,
): { store: Writable<T[]>; actions: TActions } {
	const { storageKey, initialActions } = config;
	const { load, save } = createLocalStorageManager<T>(storageKey);

	const store = writable<T[]>(load());

	store.subscribe(save);

	const baseActions: BaseStoreActions<T> = {
		createEntry(entry: T): void {
			store.update((entries) => [entry, ...entries]);
		},

		getEntry(id: string): T | undefined {
			return get(store).find((entry) => entry.id === id);
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
			return get(store).some((entry) => entry.id === id);
		},
	};

	const extraActions = initialActions(baseActions);

	const actions = {
		...extraActions,
		...baseActions,
	} as TActions;

	return { store, actions };
}
