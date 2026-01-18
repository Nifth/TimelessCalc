import type { SearchStore, TreeStore, TreeData } from '$lib/types';

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
export function generateShareUrl(searchState: SearchStore, treeState: TreeStore, treeData: TreeData): string {
  const params = new URLSearchParams();

  // Encode search filters with short names
  if (searchState.jewelType) {
    params.set('jt', searchState.jewelType.name);
  }

  if (searchState.conqueror) {
    params.set('c', searchState.conqueror.label);
  }

  if (searchState.selectedStats && searchState.selectedStats.length > 0) {
    params.set('s', JSON.stringify(searchState.selectedStats));
  }

  if (searchState.seed !== null) {
    params.set('seed', searchState.seed.toString());
  }

  if (searchState.league) {
    params.set('l', searchState.league);
  }

  if (searchState.platform) {
    params.set('p', searchState.platform);
  }

  // Encode tree state
  if (treeState.chosenSocket) {
    params.set('so', treeState.chosenSocket.skill.toString());

    // Get nodes in jewel radius for optimization
    const socket = treeState.chosenSocket;
    const socketNodeIds = treeData.socketNodes[socket.skill.toString()] || [];
    const radiusNodes: number[] = socketNodeIds.map((id: string) => parseInt(id, 10));

    // Encode allocated nodes - optimize for URL size
    const allocatedSkills = Array.from(treeState.allocated.values()).map((n) => n.skill);
    const unallocatedSkills = radiusNodes.filter(skill => !allocatedSkills.includes(skill));

    if (allocatedSkills.length > unallocatedSkills.length) {
      // Encode unallocated list (smaller)
      params.set('un', JSON.stringify(unallocatedSkills));
    } else {
      // Encode allocated list
      params.set('a', JSON.stringify(allocatedSkills));
    }
  }

  // Build URL
  const baseUrl = window.location.origin + window.location.pathname;
  const url = new URL(baseUrl);
  url.search = params.toString();

  return url.toString();
}

