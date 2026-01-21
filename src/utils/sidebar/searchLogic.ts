import { treeStore } from "$lib/stores/treeStore";
import { canvas } from "$lib/konva/canvasContext";
import { parseKey, getTranslation } from "./sidebarUtils";
import type { JewelType, Stat, Translation, JewelEntry } from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import { get } from "svelte/store";
import { clearHighlights } from "$lib/konva/utils/jewelHighlight";
import {
  ensureJewelDataLoaded,
  getEntryForSeed,
  setSearchLoading,
  setSearchNotFound,
  setSearchComplete,
} from "./searchUtils";

const COLORBLIND_FRIENDLY_COLORS = [
  "#C71585", // Magenta
  "#FF7F0E", // Orange
  "#2CA02C", // Green
  "#D62728", // Red
  "#9467BD", // Purple
  "#008080", // Teal
  "#E377C2", // Pink
  "#7F7F7F", // Gray
  "#BCBD22", // Olive
  "#17BECF", // Cyan
];

function generateStatKeyColors(statKeys: number[]): Record<number, string> {
  const colors: Record<number, string> = {};
  statKeys.forEach((key, index) => {
    colors[key] = COLORBLIND_FRIENDLY_COLORS[index % COLORBLIND_FRIENDLY_COLORS.length];
  });
  return colors;
}

function applySeedModifications(
  entry: JewelEntry,
  socketNodeIds: string[],
  translation: Record<string, Translation[]>,
  jewelType: JewelType,
) {
  // Process replacements (r)
  for (const [key, nodeIds] of Object.entries(entry.r) as [string, number[]][]) {
    const stats = parseKey(key);
    for (const nodeId of nodeIds) {
      if (!socketNodeIds.includes(nodeId.toString())) continue;
      const node = canvas.treeData.nodes[nodeId.toString()];
      if (!node) continue;
      node.timelessStats = stats.map(({ statId, value }) =>
        getTranslation(statId, value, translation),
      );
      node.timelessStatKeys = stats.map(({ statId }) => statId);
      node.timelessStatValues = stats.map(({ value }) => value);
    }
  }
  // Process additions (a)
  for (const [key, nodeIds] of Object.entries(entry.a) as [string, number[]][]) {
    const stats = parseKey(key);
    for (const nodeId of nodeIds) {
      if (!socketNodeIds.includes(nodeId.toString())) continue;
      const node = canvas.treeData.nodes[nodeId.toString()];
      if (!node) continue;
      node.timelessStats = [];
      node.timelessStatKeys = [];
      node.timelessStatValues = [];
      node.stats?.forEach((stat) => {
        node.timelessStats!.push(stat);
      });
      stats.forEach(({ statId, value }) => {
        node.timelessStats!.push(
          getTranslation(statId, value, translation),
        );
        node.timelessStatKeys!.push(statId);
        node.timelessStatValues!.push(value);
      });
      console.log(node);
    }
  }
  // Apply base effects according to jewelType
  const label = jewelType.name;
  let travelStat = "",
    baseStat = "";
  if (label === "karui") {
    travelStat = "+2 to Strength";
    baseStat = '+4 to Strength';
  } else if (label === "maraketh") {
    travelStat = "+2 to Dexterity";
    baseStat = '+4 to Strength';
  } else if (label === "templar") {
    baseStat = "+5 to Devotion";
    travelStat = "+10 to Devotion";
  } else if (label === "eternal") {
    baseStat = "void";
    travelStat = "void";
  }
  if (baseStat) {
    for (const nodeId of socketNodeIds) {
      const node = canvas.treeData.nodes[nodeId.toString()];
      if (!node) {
        console.warn(`Node ${nodeId} not found in tree data`);
        continue;
      }
      if (!node.isNotable && !node.isKeystone && !node.isJewelSocket) {
        node.timelessStats = [];
        node.timelessStatKeys = [];
        node.timelessStatValues = [];
        if (baseStat !== "void") {
          node.stats?.forEach((stat) => {
            node.timelessStats!.push(stat);
          });
          if (['Strength', 'Dexterity', 'Intelligence'].includes(node.name)) {
            node.timelessStats.push(travelStat);
          } else {
            node.timelessStats.push(baseStat);
          }
        }
      }
    }
  }
}

export async function applySeed(
  seed: number,
  jewelType: JewelType,
  translation: Record<string, Translation[]>,
) {
  const jewelData = await ensureJewelDataLoaded(jewelType);
  if (!jewelData) {
    return;
  }
  const entry = getEntryForSeed(jewelData, seed);
  if (!entry) {
    return;
  }

  treeStore.update((state) => {
    const chosenSocket = state.chosenSocket?.skill;
    if (!chosenSocket) {
      alert("No jewel socket selected");
      return state;
    }
    const socketNodeIds = canvas.treeData.socketNodes[chosenSocket];
    applySeedModifications(entry, socketNodeIds, translation, jewelType);
    return state;
  });
}

export async function handleSearch(
  mode: "seed" | "stats" | null,
  seedInput: number | null,
  translation: Record<string, Translation[]>,
  jewelType: JewelType | null,
  selectedStats: Stat[],
) {
  setSearchLoading(true);
  clearHighlights();
  if (mode === "seed") {
    if (!seedInput || !jewelType) {
      setSearchNotFound();
      return;
    }
    const jewelData = await ensureJewelDataLoaded(jewelType);
    if (!jewelData) {
      setSearchLoading(false);
      return;
    }
    const entry = getEntryForSeed(jewelData, seedInput);
    if (!entry) {
      setSearchNotFound();
      return;
    }

    treeStore.update((state) => {
      const chosenSocket = state.chosenSocket?.skill;
      if (!chosenSocket) {
        alert("No jewel socket selected");
        return state;
      }
      const socketNodeIds = canvas.treeData.socketNodes[chosenSocket];
      
      applySeedModifications(entry, socketNodeIds, translation, jewelType);
      
      const allocatedNodeIds = Array.from(state.allocated.keys());
      applySeedModifications(entry, allocatedNodeIds, translation, jewelType);
      
      return state;
    });
    setSearchComplete();
  } else if (mode === "stats") {
    if (selectedStats.length === 0 || !jewelType) {
      setSearchNotFound();
      return;
    }
    const jewelData = await ensureJewelDataLoaded(jewelType);
    if (!jewelData) {
      setSearchLoading(false);
      return;
    }
    // Results: for each seed, count occurrences of each selected stat on allocated nodes
    const results: Record<
      number,
      {
        statCounts: Record<number, number>;
        statTotals: Record<number, number>;
      }
    > = {};

    for (const seedStr of Object.keys(jewelData)) {
      const seed = parseInt(seedStr);
      const entry = jewelData[seed];
      if (!entry) continue;

      const statCounts: Record<number, number> = {};
      const statTotals: Record<number, number> = {};

      // Process 'r' and 'a'
      for (const type of ["r", "a"] as const) {
        for (const [key, nodeIds] of Object.entries(entry[type] || {})) {
          const stats = parseKey(key);
          for (const { statId, value } of stats) {
            if (selectedStats.some((s) => s.statKey === statId)) {
              // Count for each allocated nodeId
              for (const nodeId of nodeIds) {
                if (get(treeStore).allocated.has(nodeId.toString())) {
                  statCounts[statId] = (statCounts[statId] || 0) + 1;
                  statTotals[statId] = (statTotals[statId] || 0) + value;
                }
              }
            }
          }
        }
      }

      // If at least one stat has a count > 0, add to results
      if (Object.values(statCounts).some((count) => count > 0)) {
        results[seed] = { statCounts, statTotals };
      }
    }

    // Group by total weight
    const grouped: Record<
      string,
      {
        seed: number;
        statCounts: Record<number, number>;
        statTotals: Record<number, number>;
        totalWeight: number;
      }[]
    > = {};
for (const [seed, { statCounts, statTotals }] of Object.entries(results)) {
      let totalWeight = 0;
      const minTotalWeight = get(searchStore).minTotalWeight;
      for (const stat of selectedStats) {
        const count = statCounts[stat.statKey] || 0;
        if (count >= stat.minWeight) {
          totalWeight += count * stat.weight;
        }
      }
      if (totalWeight >= minTotalWeight) {
        const key = totalWeight.toFixed(1);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
          seed: parseInt(seed),
          statCounts,
          statTotals,
          totalWeight,
        });
      }
    }

    const sortedWeights = Object.keys(grouped).sort(
      (a, b) => parseFloat(b) - parseFloat(a),
    );
    const orderedSeeds: number[] = [];
    for (const weight of sortedWeights) {
      const seedsInGroup = grouped[weight]
        .sort((a, b) => a.seed - b.seed)
        .map((g) => g.seed);
      orderedSeeds.push(...seedsInGroup);
    }

    // Generate colors for all unique stat keys found in results
    const allStatKeys = new Set<number>();
    for (const { statCounts } of Object.values(results)) {
      Object.keys(statCounts).forEach(key => allStatKeys.add(parseInt(key)));
    }
    const statKeyColors = generateStatKeyColors(Array.from(allStatKeys));

    searchStore.update((state) => {
      state.searched = true;
      state.loading = false;
      state.statsResults = grouped;
      state.statKeyColors = statKeyColors;
      state.orderedSeeds = orderedSeeds;
      state.totalResults = orderedSeeds.length;
      state.currentPage = 0;
      return state;
    });
  }
}
