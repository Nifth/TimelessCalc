import { jewelTypes, conquerors } from "$lib/constants/timeless";
import type { TreeData, Node, Stat, Translation, JewelType } from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import { treeStore } from "$lib/stores/treeStore";
import {
  changeRadius,
  changeKeystone,
  updateSocketVisualSelection,
} from "$lib/konva/utils/jewelHighlight";
import type Konva from "konva";

/**
 * Parses URL parameters and initializes the application state
 */
export function parseUrlAndInitialize(
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
): boolean {
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
  const conqueror =
    conquerors[jewelType.name]?.find((c) => c.label === conquerorLabel) || null;
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

  const minTotalWeight = urlParams.get("tw") || 0;

  // Parse chosen socket
  const socketSkill = parseInt(socketSkillStr, 10);
  if (isNaN(socketSkill)) {
    console.log("Invalid socket skill:", socketSkillStr);
    return false;
  }
  const chosenSocket: Node | null =
    Object.values(treeData.nodes).find((node) => node.skill === socketSkill) ||
    null;
  if (!chosenSocket) {
    console.log("Socket not found:", socketSkill);
    return false;
  }

  // Parse allocated/unallocated nodes
  const allocated = new Map<string, Node>();
  if (chosenSocket && socketSkillStr) {
    const socketNodeIds = treeData.socketNodes[socketSkillStr] || [];
    const radiusNodes: number[] = socketNodeIds.map((id: string) =>
      parseInt(id, 10),
    );
    const allocatedJson = urlParams.get("a");
    const unallocatedJson = urlParams.get("un");

    let allocatedSkills: number[] = [];

    if (allocatedJson) {
      try {
        allocatedSkills = JSON.parse(allocatedJson);
      } catch (e) {
        console.error("Failed to parse allocated nodes from URL:", e);
      }
    } else if (unallocatedJson) {
      try {
        const unallocatedSkills: number[] = JSON.parse(unallocatedJson);
        allocatedSkills = radiusNodes.filter(
          (skill) => !unallocatedSkills.includes(skill),
        );
      } catch (e) {
        console.error("Failed to parse unallocated nodes from URL:", e);
      }
    }

    // Convert skills to nodes
    allocatedSkills.forEach((skill) => {
      const node = Object.values(treeData.nodes).find((n) => n.skill === skill);
      if (node) {
        allocated.set(node.skill.toString(), node);
      }
    });
  }

  // Update stores
  searchStore.update((s) => ({
    ...s,
    jewelType,
    conqueror,
    selectedStats,
    seed,
    league,
    platform,
    searched: false, // Will be set after search
    statsResults: {},
    currentPage: 0,
    totalResults: 0,
    orderedSeeds: [],
    lastTradeInfo: null,
    mode,
    minTotalWeight: Number(minTotalWeight),
    statsSearched: mode === "stats",
    seedSearched: mode === "seed",
    automated: true,
  }));

  treeStore.update((t) => ({
    ...t,
    chosenSocket,
    allocated,
    search: "",
    scale: 0.1,
    hovered: null,
    loading: true,
  }));

  // Update visual display of jewel sockets (selected state)
  updateSocketVisualSelection();

  // Center canvas on chosen socket if available
  if (chosenSocket && canvas.stage) {
    centerCanvasOnSocket(canvas.stage, chosenSocket, 0.2);
  }

  // Mark loading complete
  treeStore.update((t) => ({ ...t, loading: false }));

  // Update radius and keystone display without overwriting allocated nodes
  if (chosenSocket) {
    changeRadius(chosenSocket);
    changeKeystone(chosenSocket);
  }

  // Trigger search if we have search parameters
  if (jewelType && conqueror && selectedStats.length > 0) {
    performSearch("stats", null, translation, jewelType, selectedStats);
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
  searchStore.update((s) => ({
    ...s,
    automated: false,
  }));
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
