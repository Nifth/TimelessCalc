import type { BaseEntry } from "$lib/stores/utils/storeUtils";
import type { Translation } from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import { get } from "svelte/store";
import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";

export interface LoadEntryOptions<T extends BaseEntry> {
	entry: T;
	loadAction: (entry: T) => void;
	translation: Record<string, Translation[]>;
	onSwitchToTab: () => void;
}

export async function loadEntry<T extends BaseEntry>(
	options: LoadEntryOptions<T>,
): Promise<void> {
	const { entry, loadAction, translation, onSwitchToTab } = options;

	searchStore.update((s) => {
		s.automated = true;
		return s;
	});
	loadAction(entry);

	onSwitchToTab();

	await performSearch("stats", null, translation, entry.jewelType, entry.stats);

	const currentSearchStore = get(searchStore);
	if (currentSearchStore.searched) {
		searchStore.update((s) => {
			s.statsSearched = true;
			return s;
		});
	}
	searchStore.update((s) => {
		s.automated = false;
		return s;
	});
}
