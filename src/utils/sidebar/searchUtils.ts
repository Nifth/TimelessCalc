import { loadJewel, getJewelData } from "$lib/providers/jewels";
import { searchStore, setJewelLoadError } from "$lib/stores/searchStore";
import type {
  JewelType,
  JewelEntry,
  Stat,
  Conqueror,
  Platform,
} from "$lib/types";
import { resetFull } from "$lib/utils/search/resetStore";

export interface JewelLoadResult {
  jewelData: Record<number, JewelEntry> | null;
  entry: JewelEntry | null;
}

export interface SearchStoreInitParams {
  jewelType: JewelType | null;
  conqueror: Conqueror | null;
  selectedStats: Stat[];
  seed: number | null;
  league: string;
  platform: Platform;
  mode: "seed" | "stats" | null;
  minTotalWeight: number;
  statSearchMode?: "occurrences" | "totalValue";
}

export async function loadJewelData(
  jewelType: JewelType,
  socketSkill?: string,
): Promise<Record<number, JewelEntry> | null> {
  if (!socketSkill) {
    console.warn("loadJewelData called without socketSkill");
    return null;
  }

  const cached = getJewelData(jewelType.name, socketSkill);
  if (cached) {
    return cached;
  }

  try {
    await loadJewel(jewelType.name, socketSkill);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setJewelLoadError(jewelType, message);
    return null;
  }

  const jewelData = getJewelData(jewelType.name, socketSkill);
  return jewelData ?? null;
}

export function getEntryForSeed(
  jewelData: Record<number, JewelEntry>,
  seed: number,
): JewelEntry | null {
  return jewelData[seed] ?? null;
}

export function setSearchLoading(loading: boolean): void {
  searchStore.update((state) => {
    state.loading = loading;
    return state;
  });
}

export function setSearchNotFound(): void {
  searchStore.update((state) => {
    state.searched = false;
    state.loading = false;
    return state;
  });
}

export function setSearchComplete(): void {
  searchStore.update((state) => {
    state.searched = true;
    state.loading = false;
    return state;
  });
}

export const ensureJewelDataLoaded = loadJewelData;

export function initializeSearchStore(params: SearchStoreInitParams): void {
  resetFull();
  searchStore.update((s) => {
    s.jewelType = params.jewelType;
    s.conqueror = params.conqueror;
    s.selectedStats = params.selectedStats;
    s.seed = params.seed;
    s.league = params.league;
    s.platform = params.platform;
    s.lastTradeInfo = null;
    s.mode = params.mode;
    s.minTotalWeight = params.minTotalWeight;
    s.statSearchMode = params.statSearchMode ?? "occurrences";
    s.statsSearched = false;
    s.seedSearched = false;
    s.automated = true;
    return s;
  });
}

export function finalizeSearchStoreInitialization(): void {
  searchStore.update((s) => {
    s.automated = false;
    return s;
  });
}
