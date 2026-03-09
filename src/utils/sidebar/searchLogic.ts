import { treeStore } from "$lib/stores/treeStore";
import { canvas } from "$lib/canvas/canvasContext";
import { parseKey, formatStatTranslation } from "./sidebarUtils";
import type {
  JewelType,
  Stat,
  Translation,
  JewelEntry,
  Node as TreeNode,
} from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import { get } from "svelte/store";
import { tick } from "svelte";
import {
  loadJewelData,
  getEntryForSeed,
  setSearchLoading,
  setSearchNotFound,
  setSearchComplete,
} from "./searchUtils";
import { validateSocket } from "$lib/utils/socketValidation";
import { SEARCH_DEBOUNCE_MS } from "$lib/constants/performance";

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
    colors[key] =
      COLORBLIND_FRIENDLY_COLORS[index % COLORBLIND_FRIENDLY_COLORS.length];
  });
  return colors;
}

function processNodeModifications(
  entry: Record<string, number[]>,
  socketNodeIds: string[],
  translation: Record<string, Translation[]>,
  processor: (
    node: TreeNode,
    stats: { statId: number; value: number }[],
  ) => void,
): void {
  for (const [key, nodeIds] of Object.entries(entry)) {
    const stats = parseKey(key);
    for (const nodeId of nodeIds) {
      if (!socketNodeIds.includes(nodeId.toString())) continue;
      const node = canvas.treeData.nodes[nodeId.toString()];
      if (!node) continue;
      processor(node, stats);
    }
  }
}

function applySeedModifications(
  entry: JewelEntry,
  socketNodeIds: string[],
  translation: Record<string, Translation[]>,
  jewelType: JewelType,
) {
  // Process replacements (r)
  processNodeModifications(
    entry.r,
    socketNodeIds,
    translation,
    (node, stats) => {
      node.timelessStats = stats.map(({ statId, value }) =>
        formatStatTranslation(statId, value, translation),
      );
      node.timelessStatKeys = stats.map(({ statId }) => statId);
      node.timelessStatValues = stats.map(({ value }) => value);
    },
  );

  // Process additions (a)
  processNodeModifications(
    entry.a,
    socketNodeIds,
    translation,
    (node, stats) => {
      node.timelessStats = [];
      node.timelessStatKeys = [];
      node.timelessStatValues = [];
      node.stats?.forEach((stat) => {
        node.timelessStats!.push(stat);
      });
      stats.forEach(({ statId, value }) => {
        node.timelessStats!.push(
          formatStatTranslation(statId, value, translation),
        );
        node.timelessStatKeys!.push(statId);
        node.timelessStatValues!.push(value);
      });
    },
  );
  // Apply base effects according to jewelType
  const label = jewelType.name;
  let travelStat = "",
    baseStat = "",
    travelReplace = false;
  if (label === "karui") {
    travelStat = "+2 to Strength";
    baseStat = "+4 to Strength";
  } else if (label === "maraketh") {
    travelStat = "+2 to Dexterity";
    baseStat = "+4 to Dexterity";
  } else if (label === "templar") {
    baseStat = "+5 to Devotion";
    travelStat = "+10 to Devotion";
    travelReplace = true;
  } else if (label === "eternal") {
    baseStat = "void";
    travelStat = "void";
  } else if (label === "kalguur") {
      travelStat = "+1 to Ward";
      baseStat = "+2 to Ward";
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
          const isTravelStat = [
            "Strength",
            "Dexterity",
            "Intelligence",
          ].includes(node.name);
          if (isTravelStat) {
            if (!travelReplace) {
              node.stats?.forEach((stat: string) => {
                node.timelessStats!.push(stat);
              });
            }
            node.timelessStats.push(travelStat);
          } else {
            node.stats?.forEach((stat: string) => {
              node.timelessStats!.push(stat);
            });
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
  const chosenSocket = get(treeStore).chosenSocket?.skill;
  if (!chosenSocket) {
    return;
  }
  const jewelData = await loadJewelData(jewelType, String(chosenSocket));
  if (!jewelData) {
    return;
  }
  const entry = getEntryForSeed(jewelData, seed);
  if (!entry) {
    return;
  }

  const warning = validateSocket();
  if (warning) {
    alert(warning);
    return;
  }

  treeStore.update((state) => {
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
  await tick();
  if (mode === "seed") {
    if (!seedInput || !jewelType) {
      setSearchNotFound();
      return;
    }
    const chosenSocket = get(treeStore).chosenSocket?.skill;
    if (!chosenSocket) {
      setSearchNotFound();
      return;
    }
    const jewelData = await loadJewelData(jewelType, String(chosenSocket));
    if (!jewelData) {
      setSearchLoading(false);
      return;
    }
    const entry = getEntryForSeed(jewelData, seedInput);
    if (!entry) {
      setSearchNotFound();
      return;
    }

    const warning = validateSocket();
    if (warning) {
      alert(warning);
      setSearchNotFound();
      return;
    }

    treeStore.update((state) => {
      const socketNodeIds = canvas.treeData.socketNodes[chosenSocket];

      applySeedModifications(entry, socketNodeIds, translation, jewelType);

      return state;
    });
    setSearchComplete();
  } else if (mode === "stats") {
    if (selectedStats.length === 0 || !jewelType) {
      setSearchNotFound();
      return;
    }
    const chosenSocket = get(treeStore).chosenSocket?.skill;
    if (!chosenSocket) {
      setSearchNotFound();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS));
    const jewelData = await loadJewelData(jewelType, String(chosenSocket));
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

      // All selected stats must meet their minimum weight requirement
      // Check based on statSearchMode: occurrences or total value
      const statSearchMode = get(searchStore).statSearchMode;
      const meetsMinRequirement = selectedStats.every((stat) => {
        if (statSearchMode === "occurrences") {
          return (statCounts[stat.statKey] || 0) >= stat.minWeight;
        } else {
          return (statTotals[stat.statKey] || 0) >= stat.minWeight;
        }
      });

      if (meetsMinRequirement) {
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
    const statSearchMode = get(searchStore).statSearchMode;
    for (const [seed, { statCounts, statTotals }] of Object.entries(results)) {
      let totalWeight = 0;
      const minTotalWeight = get(searchStore).minTotalWeight;
      for (const stat of selectedStats) {
        const count = statCounts[stat.statKey] || 0;
        const total = statTotals[stat.statKey] || 0;
        // Check min requirement for this stat based on mode
        const meetsMin =
          statSearchMode === "occurrences"
            ? count >= stat.minWeight
            : total >= stat.minWeight;
        if (meetsMin) {
          // Weight is based on mode: occurrences or total value
          const weightValue = statSearchMode === "occurrences" ? count : total;
          totalWeight += weightValue * stat.weight;
        }
      }
      if (totalWeight >= minTotalWeight) {
        const key = totalWeight.toFixed(1);
        if (!totalWeight) continue;
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
      Object.keys(statCounts).forEach((key) => allStatKeys.add(parseInt(key)));
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
