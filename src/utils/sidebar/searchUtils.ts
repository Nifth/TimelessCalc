import { loadJewel, getJewelData } from "$lib/providers/jewels";
import { searchStore, setJewelLoadError } from "$lib/stores/searchStore";
import type { JewelType, JewelEntry, Stat, Conqueror, Platform } from "$lib/types";
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
): Promise<Record<number, JewelEntry> | null> {
  const cached = getJewelData(jewelType.name);
  if (cached) {
    return cached;
  }

  try {
    await loadJewel(jewelType.name);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setJewelLoadError(jewelType, message);
    return null;
  }

  const jewelData = getJewelData(jewelType.name);
  return jewelData ?? null;
}

export function getEntryForSeed(
  jewelData: Record<number, JewelEntry>,
  seed: number,
): JewelEntry | null {
  return jewelData[seed] ?? null;
}

export function setSearchLoading(loading: boolean): void {
  searchStore.update((state) => ({ ...state, loading }));
}

export function setSearchNotFound(): void {
  searchStore.update((state) => ({
    ...state,
    searched: false,
    loading: false,
  }));
}

export function setSearchComplete(): void {
  searchStore.update((state) => ({
    ...state,
    searched: true,
    loading: false,
  }));
}

export const ensureJewelDataLoaded = loadJewelData;

export function initializeSearchStore(params: SearchStoreInitParams): void {
  resetFull();
  searchStore.update((s) => ({
    ...s,
    jewelType: params.jewelType,
    conqueror: params.conqueror,
    selectedStats: params.selectedStats,
    seed: params.seed,
    league: params.league,
    platform: params.platform,
    lastTradeInfo: null,
    mode: params.mode,
    minTotalWeight: params.minTotalWeight,
    statSearchMode: params.statSearchMode ?? "occurrences",
    statsSearched: params.mode === "stats",
    seedSearched: params.mode === "seed",
    automated: true,
  }));
}

export function finalizeSearchStoreInitialization(): void {
  searchStore.update((s) => ({
    ...s,
    automated: false,
  }));
}
