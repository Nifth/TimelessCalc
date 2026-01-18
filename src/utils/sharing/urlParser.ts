import { jewelTypes, conquerors } from "$lib/constants/timeless";
import type { SearchStore, TreeStore, TreeData, Node, Stat } from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import { treeStore } from "$lib/stores/treeStore";
import type Konva from "konva";

/**
 * Parses URL parameters and initializes the application state
 */
export function parseUrlAndInitialize(
  treeData: TreeData,
  canvas: { stage: Konva.Stage | null },
  performSearch: (mode: "seed" | "stats" | null, seedInput: number | null, translation: Record<string, any[]>, jewelType: any, selectedStats: Stat[]) => Promise<void>,
  translation: Record<string, any[]>,
  onComplete?: () => void
) {
  const urlParams = new URLSearchParams(window.location.search);
  
  // If no URL parameters, nothing to do
  if (urlParams.toString() === '') {
    onComplete?.();
    return;
  }

  console.log('Initializing from URL parameters:', Object.fromEntries(urlParams.entries()));

  // Set loading state
  searchStore.update(s => ({ ...s, loading: true }));

  // Parse jewel type
  const jewelTypeName = urlParams.get('jt');
  let jewelType = null;
  if (jewelTypeName) {
    jewelType = jewelTypes.find(jt => jt.name === jewelTypeName) || null;
  }

  // Parse conqueror
  const conquerorLabel = urlParams.get('c');
  let conqueror = null;
  if (conquerorLabel && jewelType) {
    conqueror = conquerors[jewelType.name]?.find(c => c.label === conquerorLabel) || null;
  }

  // Parse selected stats
  const selectedStatsJson = urlParams.get('s');
  let selectedStats: Stat[] = [];
  if (selectedStatsJson) {
    try {
      selectedStats = JSON.parse(selectedStatsJson);
    } catch (e) {
      console.error('Failed to parse selected stats from URL:', e);
    }
  }

  // Parse seed
  const seedStr = urlParams.get('seed');
  let seed: number | null = null;
  if (seedStr) {
    seed = parseInt(seedStr, 10) || null;
  }

  // Parse league
  const league = urlParams.get('l') || 'Keepers';

  // Parse platform
  const platform = (urlParams.get('p') as "PC" | "Xbox" | "Playstation") || 'PC';

  // Parse mode
  const modeStr = urlParams.get('m');
  let mode: "seed" | "stats" | null = null;
  if (modeStr === 'seed' || modeStr === 'stats') {
    mode = modeStr;
  }

  // Parse chosen socket
  const socketSkillStr = urlParams.get('so');
  let chosenSocket: Node | null = null;
  if (socketSkillStr) {
    const socketSkill = parseInt(socketSkillStr, 10);
    chosenSocket = Object.values(treeData.nodes).find(node => node.skill === socketSkill) || null;
  }

  // Parse allocated/unallocated nodes
  let allocated = new Map<string, Node>();
  if (chosenSocket && socketSkillStr) {
    const socketNodeIds = treeData.socketNodes[socketSkillStr] || [];
    const radiusNodes: number[] = socketNodeIds.map((id: string) => parseInt(id, 10));
    
    const allocatedJson = urlParams.get('a');
    const unallocatedJson = urlParams.get('un');
    
    let allocatedSkills: number[] = [];
    
    if (allocatedJson) {
      try {
        allocatedSkills = JSON.parse(allocatedJson);
      } catch (e) {
        console.error('Failed to parse allocated nodes from URL:', e);
      }
    } else if (unallocatedJson) {
      try {
        const unallocatedSkills: number[] = JSON.parse(unallocatedJson);
        allocatedSkills = radiusNodes.filter(skill => !unallocatedSkills.includes(skill));
      } catch (e) {
        console.error('Failed to parse unallocated nodes from URL:', e);
      }
    }
    
    // Convert skills to nodes
    allocatedSkills.forEach(skill => {
      const node = Object.values(treeData.nodes).find(n => n.skill === skill);
      if (node) {
        allocated.set(node.skill.toString(), node);
      }
    });
  }

  // Update stores
  searchStore.update(s => ({
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
    statsSearched: mode === "stats",
    seedSearched: mode === "seed",
  }));

  treeStore.update(t => ({
    ...t,
    chosenSocket,
    allocated,
    search: "",
    scale: 0.1,
    hovered: null,
  }));

  // Center canvas on chosen socket if available
  if (chosenSocket && canvas.stage) {
    centerCanvasOnSocket(canvas.stage, chosenSocket, 0.2);
  }

  // Trigger search if we have search parameters
  if (jewelType && conqueror && selectedStats.length > 0) {
    performSearch("stats", null, translation, jewelType, selectedStats).then(() => {
      searchStore.update(s => ({ ...s, loading: false }));
      onComplete?.();
    });
  } else {
    searchStore.update(s => ({ ...s, loading: false }));
    onComplete?.();
  }
}

/**
 * Centers the canvas on a specific socket
 */
function centerCanvasOnSocket(stage: Konva.Stage, socket: Node, scale: number) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  // Position so that socket is at center
  const posX = centerX - (socket.x * scale);
  const posY = centerY - (socket.y * scale);
  
  stage.position({ x: posX, y: posY });
  stage.batchDraw();
}