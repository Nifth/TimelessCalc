import type { SearchHistoryEntry } from "$lib/types";
import {
	createPersistedStore,
	type BaseStoreActions,
} from "$lib/stores/utils/storeFactory";
import {
	loadConfiguration,
	createBaseEntry,
} from "$lib/stores/utils/storeUtils";

const HISTORY_KEY = "timelessCalc_searchHistory";
const MAX_HISTORY_ENTRIES = 10;

interface HistoryExtraActions {
	saveCurrentSearch(): void;
	loadSearch(entry: SearchHistoryEntry): void;
	clearHistory(): void;
}

export const { store: historyStore, actions: historyActions } =
	createPersistedStore<
		SearchHistoryEntry,
		BaseStoreActions<SearchHistoryEntry> & HistoryExtraActions
	>({
		storageKey: HISTORY_KEY,
		initialActions: (_baseActions) => ({
			saveCurrentSearch(): void {
				const baseEntry = createBaseEntry();
				if (!baseEntry) return;

				const entry: SearchHistoryEntry = baseEntry;

				historyStore.update((entries) => {
					const newHistory = [
						entry,
						...entries.slice(0, MAX_HISTORY_ENTRIES - 1),
					];
					return newHistory;
				});
			},

			loadSearch(entry: SearchHistoryEntry): void {
				loadConfiguration(entry);
			},

			clearHistory(): void {
				historyStore.set([]);
			},
		}),
	});
