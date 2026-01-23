import type { BaseEntry } from "$lib/stores/utils/storeUtils";
import type { Translation, TreeData } from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import type Konva from "konva";
import { treeStore } from "$lib/stores/treeStore";
import { get } from "svelte/store";
import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
import { centerCanvasOnSocket } from "$lib/utils/sharing/urlParser";
import { changeRadius } from "$lib/konva/utils/jewelHighlight";

export interface LoadEntryOptions<T extends BaseEntry> {
  entry: T;
  loadAction: (entry: T) => void;
  translation: Record<string, Translation[]>;
  canvas: { stage: Konva.Stage | null; treeData: TreeData };
  onSwitchToTab: () => void;
}

export async function loadEntry<T extends BaseEntry>(
  options: LoadEntryOptions<T>,
): Promise<void> {
  const { entry, loadAction, translation, canvas, onSwitchToTab } = options;

  searchStore.update((s) => ({
    ...s,
    automated: true,
  }));
  loadAction(entry);

  if (canvas.stage && entry.socket) {
    centerCanvasOnSocket(canvas.stage, entry.socket, 0.2);
    changeRadius(entry.socket);
    treeStore.update((s) => ({ ...s, scale: 0.2 }));
  }

  onSwitchToTab();

  await performSearch("stats", null, translation, entry.jewelType, entry.stats);

  const currentSearchStore = get(searchStore);
  if (currentSearchStore.searched) {
    searchStore.update((s) => ({
      ...s,
      statsSearched: true,
    }));
  }
  searchStore.update((s) => ({
    ...s,
    automated: false,
  }));
}
