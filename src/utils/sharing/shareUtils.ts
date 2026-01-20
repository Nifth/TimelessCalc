import type { SearchStore, TreeStore, TreeData, Stat, JewelType, Conqueror, Node } from "$lib/types";
import data from "$lib/data/tree.json" with { type: "json" };

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
    searchState.league,
    searchState.platform,
)
}

export function generateShareUrlFromData(
  jewelType: JewelType | null,
  conqueror: Conqueror | null,
  selectedStats: Stat[],
  chosenSocket: Node | null,
  allocatedSkills: number[],
  minTotalWeight: number | null,
  league: string | null,
  platform: string | null,
): string {
  const treeData: TreeData = data as unknown as TreeData;
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
  if (chosenSocket) {
    params.set('so', chosenSocket.skill.toString());
    if (allocatedSkills.length > 0) {
      const socketNodeIds = treeData.socketNodes[chosenSocket.skill.toString()] || [];
      const radiusNodes: number[] = socketNodeIds.map((id: string) =>
        parseInt(id, 10),
      );

      const unallocatedSkills = radiusNodes.filter(
        (skill) => !allocatedSkills.includes(skill),
      );

      if (allocatedSkills.length > unallocatedSkills.length) {
        // Encode unallocated list (smaller)
        params.set("un", JSON.stringify(unallocatedSkills));
      } else {
        // Encode allocated list
        params.set("a", JSON.stringify(allocatedSkills));
      }
    }
  }

  const baseUrl = window.location.origin + window.location.pathname;
  const url = new URL(baseUrl);
  url.search = params.toString();

  return url.toString();
}
