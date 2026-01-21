import { treeStore } from "$lib/stores/treeStore";
import { get } from "svelte/store";
import type { Node } from "$lib/types";

export function hasSocketSelected(): boolean {
  const treeState = get(treeStore);
  return !!treeState.chosenSocket;
}

export function getSelectedSocket(): Node | null {
  const treeState = get(treeStore);
  return treeState.chosenSocket || null;
}

export function withSocket<T>(
  callback: (socket: Node) => T,
  onNoSocket?: () => void
): T | undefined {
  const socket = getSelectedSocket();
  if (!socket) {
    onNoSocket?.();
    return undefined;
  }
  return callback(socket);
}

export function showSocketWarning(message?: string): void {
  const warning = message ||
    "No jewel socket selected. Please select a socket on the passive tree.";
  alert(warning);
}

export function validateSocket(): string | null {
  if (!hasSocketSelected()) {
    return "No jewel socket selected. Please select a socket on the passive tree.";
  }
  return null;
}
