import { jewelTypes, conquerors } from "$lib/constants/timeless";
import type { TreeData, Node, Stat, Translation, JewelType } from "$lib/types";
import { findNodeBySkill } from "$lib/utils/nodeUtils";
import { searchStore } from "$lib/stores/searchStore";
import { treeStore } from "$lib/stores/treeStore";
import {
  changeRadius,
  changeKeystone,
  updateSocketVisualSelection,
  updateAllocatedDisplay,
} from "$lib/konva/utils/jewelHighlight";
import type Konva from "konva";
import {
  initializeSearchStore,
  finalizeSearchStoreInitialization,
} from "$lib/utils/sidebar/searchUtils";
import { reconstructAllocatedNodes } from "$lib/utils/socketNodeProcessor";

/**
 * Parses URL parameters and initializes the application state
 */
export async function parseUrlAndInitialize(
  treeData: TreeData,
  canvas: { stage: Konva.Stage | null },
  performSearch: (
    mode: "seed" | "stats" | null,
    seedInput: number | null,
    translation: Record<string, Translation[]>,
    jewelType: JewelType | null,
    selectedStats: Stat[],
  ) => Promise<void>,
  translation: Record<string, Translation[]>,
): Promise<boolean> {
  const urlParams = new URLSearchParams(window.location.search);

  // If no URL parameters, nothing to do
  if (urlParams.toString() === "") {
    return false;
  }

  console.log(
    "Initializing from URL parameters:",
    Object.fromEntries(urlParams.entries()),
  );

  // Check for required parameters
  const jewelTypeName = urlParams.get("jt");
  const conquerorLabel = urlParams.get("c");
  const selectedStatsJson = urlParams.get("s");
  const seedStr = urlParams.get("seed");
  const socketSkillStr = urlParams.get("so");

  if (
    !jewelTypeName ||
    !conquerorLabel ||
    !socketSkillStr ||
    (!selectedStatsJson && !seedStr)
  ) {
    console.log(
      "Missing required URL parameters (jt, c, so, and s or seed), skipping initialization",
    );
    return false;
  }

  // Parse jewel type
  const jewelType = jewelTypes.find((jt) => jt.name === jewelTypeName) || null;
  if (!jewelType) {
    console.log("Invalid jewel type:", jewelTypeName);
    return false;
  }

  // Parse conqueror
  const jewelTypeConquerors = conquerors[jewelType.name] || [];
  const conqueror = jewelTypeConquerors.find((c) => c.label === conquerorLabel) || null;
  if (!conqueror) {
    console.log("Invalid conqueror:", conquerorLabel);
    return false;
  }

  // Parse selected stats
  let selectedStats: Stat[] = [];
  if (selectedStatsJson) {
    try {
      selectedStats = JSON.parse(selectedStatsJson);
    } catch (e) {
      console.error("Failed to parse selected stats from URL:", e);
      return false;
    }
  }

  // Parse seed
  let seed: number | null = null;
  if (seedStr) {
    seed = parseInt(seedStr, 10) || null;
    if (seed === null || isNaN(seed)) {
      console.log("Invalid seed:", seedStr);
      return false;
    }
  }

  // Parse league
  // Todo: change default value to retrieve from API
  const league = urlParams.get("l") || "Keepers";

  // Parse platform
  const platform =
    (urlParams.get("p") as "PC" | "Xbox" | "Playstation") || "PC";

  // Parse mode
  const modeStr = urlParams.get("m");
  let mode: "seed" | "stats" | null = null;
  if (modeStr === "seed" || modeStr === "stats") {
    mode = modeStr;
  } else if (selectedStats.length > 0) {
    mode = "stats";
  } else if (seed) {
    mode = "seed";
  }

  const minTotalWeight = urlParams.get("tw") ? Number(urlParams.get("tw")) : 0;

  // Parse stat search mode (occurrences or totalValue)
  // Default to 'occurrences' for backward compatibility
  const statSearchModeParam = urlParams.get("sm");
  let statSearchMode: "occurrences" | "totalValue" = "occurrences";
  if (statSearchModeParam === "occurrences" || statSearchModeParam === "totalValue") {
    statSearchMode = statSearchModeParam;
  }

  // Parse chosen socket
  const socketSkill = parseInt(socketSkillStr, 10);
  if (isNaN(socketSkill)) {
    console.log("Invalid socket skill:", socketSkillStr);
    return false;
  }
  const chosenSocket = findNodeBySkill(socketSkill, treeData.nodes);
  if (!chosenSocket) {
    console.log("Socket not found:", socketSkill);
    return false;
  }

  let allocatedSkills: number[] | null = null;
  let unallocatedSkills: number[] | null = null;

  try {
    allocatedSkills = urlParams.get("a")
      ? JSON.parse(urlParams.get("a")!)
      : null;
  } catch (e) {
    console.error("Failed to parse allocated nodes from URL:", e);
  }

  try {
    unallocatedSkills = urlParams.get("un")
      ? JSON.parse(urlParams.get("un")!)
      : null;
  } catch (e) {
    console.error("Failed to parse unallocated nodes from URL:", e);
  }

  const allocated = reconstructAllocatedNodes(
    socketSkillStr,
    allocatedSkills,
    unallocatedSkills,
    treeData
  );

  // Update stores
  initializeSearchStore({
    jewelType,
    conqueror,
    selectedStats,
    seed,
    league,
    platform,
    mode,
    minTotalWeight: Number(minTotalWeight),
    statSearchMode,
  });

  treeStore.update((t) => ({
    ...t,
    chosenSocket,
    allocated,
    search: "",
    scale: 0.1,
    hovered: null,
  }));

  // Update visual display of jewel sockets (selected state)
  updateSocketVisualSelection();

  updateAllocatedDisplay();

  // Center canvas on chosen socket if available
  if (chosenSocket && canvas.stage) {
    centerCanvasOnSocket(canvas.stage, chosenSocket, 0.2);
  }

  // Update radius and keystone display without overwriting allocated nodes
  if (chosenSocket) {
    changeRadius(chosenSocket);
    changeKeystone(chosenSocket);
  }

  // Trigger search if we have search parameters
  if (jewelType && conqueror && selectedStats.length > 0) {
    await performSearch("stats", null, translation, jewelType, selectedStats);
    searchStore.update((s) => ({
      ...s,
      statsSearched: true,
    }));
  } else if (jewelType && conqueror && seed) {
    // For seed mode, just set the stores without calling applySeed to preserve allocated from URL
    searchStore.update((s) => ({
      ...s,
      searched: true,
      seed,
      seedSearched: true,
    }));
  }

  // Clear URL parameters after successful parsing to prevent re-initialization on reload
  window.history.replaceState(null, "", window.location.pathname);
  finalizeSearchStoreInitialization();
  return true;
}

/**
 * Centers the canvas on a specific socket
 */
export function centerCanvasOnSocket(
  stage: Konva.Stage,
  socket: Node,
  scale: number,
) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Position so that socket is at center
  const posX = centerX - socket.x * scale;
  const posY = centerY - socket.y * scale;

  stage.position({ x: posX, y: posY });
  stage.batchDraw();
}
