import type {
  SearchStore,
  TreeStore,
  Stat,
  JewelType,
  Conqueror,
  Node,
} from "$lib/types";
import { canvas } from "$lib/canvas/canvasContext";
import {
  getSocketNodeIds,
  prepareNodeListForEncoding,
} from "$lib/utils/socketNodeProcessor";

/**
 * Copies text to clipboard using modern API
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await window.navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates a shareable URL that encodes the current search and tree state
 */
export function generateShareUrl(
  searchState: SearchStore,
  treeState: TreeStore,
): string {
  return generateShareUrlFromData(
    searchState.jewelType,
    searchState.conqueror,
    searchState.selectedStats,
    treeState.chosenSocket,
    Array.from(treeState.allocated.values()).map((n) => n.skill),
    searchState.minTotalWeight,
    searchState.statSearchMode,
    searchState.league,
    searchState.platform,
  );
}

export function generateShareUrlFromData(
  jewelType: JewelType | null,
  conqueror: Conqueror | null,
  selectedStats: Stat[],
  chosenSocket: Node | null,
  allocatedSkills: number[],
  minTotalWeight: number | null,
  statSearchMode: string | null,
  league: string | null,
  platform: string | null,
): string {
  const treeData = canvas.treeData;
  const params = new URLSearchParams();
  if (jewelType) {
    params.set("jt", jewelType.name);
  }
  if (conqueror) {
    params.set("c", conqueror.label);
  }
  if (selectedStats.length > 0) {
    params.set("s", JSON.stringify(selectedStats));
  }
  if (league) {
    params.set("l", league);
  }
  if (platform) {
    params.set("p", platform);
  }
  if (minTotalWeight) {
    params.set("tw", minTotalWeight.toString());
  }
  if (statSearchMode && statSearchMode !== "occurrences") {
    params.set("sm", statSearchMode);
  }
  if (chosenSocket) {
    params.set("so", chosenSocket.skill.toString());
    if (allocatedSkills.length > 0) {
      const { list, param } = prepareNodeListForEncoding(
        getSocketNodeIds(chosenSocket.skill.toString(), treeData),
        allocatedSkills,
      );
      params.set(param, JSON.stringify(list));
    }
  }

  const baseUrl = window.location.origin + window.location.pathname;
  const url = new URL(baseUrl);
  url.search = params.toString();

  return url.toString();
}
