import { treeStore } from "$lib/stores/treeStore";
import { getJewelData, preloadJewels } from "$lib/providers/jewels";
import { canvas } from "$lib/konva/canvasContext";
import { parseKey, getTranslation } from "./sidebarUtils";
import type { JewelType, Conqueror, Stat, Translation } from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import { get } from "svelte/store";

export async function applySeed(
  seed: number,
  jewelType: JewelType,
  conqueror: Conqueror,
  translation: Record<string, Translation[]>,
) {
  await preloadJewels();
  const jewelData = getJewelData(jewelType.name);
  if (!jewelData) {
    return;
  }
  const entry = jewelData[seed];
  if (!entry) {
    return;
  }

  // Apply modifications to nodes
  treeStore.update((state) => {
    const chosenSocket = state.chosenSocket?.skill;
    if (!chosenSocket) {
      alert("No jewel socket selected");
      return state;
    }
    const socketNodeIds = canvas.treeData.socketNodes[chosenSocket];
    // Process replacements (r)
    for (const [key, nodeIds] of Object.entries(entry.r)) {
      const stats = parseKey(key);
      for (const nodeId of nodeIds) {
        if (!socketNodeIds.includes(nodeId.toString())) continue;
        const node = canvas.treeData.nodes[nodeId.toString()];
        if (node) {
          node.timelessStats = stats.map(({ statId, value }) =>
            getTranslation(statId, value, translation),
          );
          node.timelessStatKeys = stats.map(({ statId }) => statId);
          node.timelessStatValues = stats.map(({ value }) => value);
        }
      }
    }
    // Process additions (a)
    for (const [key, nodeIds] of Object.entries(entry.a)) {
      const stats = parseKey(key);
      for (const nodeId of nodeIds) {
        if (!socketNodeIds.includes(nodeId.toString())) continue;
        const node = canvas.treeData.nodes[nodeId.toString()];
        if (node) {
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
        }
      }
    }
    // Apply base effects according to jewelType
    if (jewelType) {
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
          if (!node) continue;
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
  if (mode === "seed") {
    if (!seedInput) {
      searchStore.update((state) => {
        state.searched = false;
        return state;
      });
      return;
    }
    // Ensure data is loaded
    await preloadJewels();
    const jewelData = getJewelData(jewelType!.name);
    if (!jewelData) {
      return;
    }
    const entry = jewelData[seedInput];
    if (!entry) {
      searchStore.update((state) => {
        state.searched = false;
        return state;
      });
      return;
    }

    // Apply modifications to nodes
    treeStore.update((state) => {
      const chosenSocket = state.chosenSocket?.skill;
      if (!chosenSocket) {
        alert("No jewel socket selected");
        return state;
      }
      const socketNodeIds = canvas.treeData.socketNodes[chosenSocket];
      // Process replacements (r)
      for (const [key, nodeIds] of Object.entries(entry.r)) {
        const stats = parseKey(key);
        for (const nodeId of nodeIds) {
          if (!socketNodeIds.includes(nodeId.toString())) continue;
          const node = canvas.treeData.nodes[nodeId.toString()];
          if (node) {
            node.timelessStats = stats.map(({ statId, value }) =>
              getTranslation(statId, value, translation),
            );
          }
        }
      }
      // Process additions (a)
      for (const [key, nodeIds] of Object.entries(entry.a)) {
        const stats = parseKey(key);
        for (const nodeId of nodeIds) {
          if (!socketNodeIds.includes(nodeId.toString())) continue;
          const node = canvas.treeData.nodes[nodeId.toString()];
          if (node) {
            node.timelessStats = [];
            node.stats?.forEach((stat) => {
              node.timelessStats!.push(stat);
            });
            stats.forEach(({ statId, value }) => {
              node.timelessStats!.push(
                getTranslation(statId, value, translation),
              );
            });
          }
        }
      }
      // Apply base effects according to jewelType
      if (jewelType) {
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
            if (!node) continue;
            if (!node.isNotable && !node.isKeystone && !node.isJewelSocket) {
              node.timelessStats = [];
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
      return state;
    });
    searchStore.update((state) => {
      state.searched = true;
      return state;
    });
  } else if (mode === "stats") {
    if (selectedStats.length === 0) {
      searchStore.update((state) => {
        state.searched = false;
        return state;
      });
      return;
    }
    // Ensure data is loaded
    await preloadJewels();
    const jewelData = getJewelData(jewelType!.name);
    if (!jewelData) {
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
      let minTotalWeight = get(searchStore).minTotalWeight;
      let statsMinWeight = 0;
      for (const stat of selectedStats) {
        const count = statCounts[stat.statKey] || 0;
        if (count >= stat.minWeight) {
          totalWeight += count * stat.weight;
        }
        statsMinWeight += stat.minWeight;
      }
      if (minTotalWeight === 0) {
        minTotalWeight = statsMinWeight;
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

    console.log("Stats search results:", grouped);

    searchStore.update((state) => {
      state.searched = true;
      state.statsResults = grouped;
      state.orderedSeeds = orderedSeeds;
      state.totalResults = orderedSeeds.length;
      state.currentPage = 0;
      return state;
    });
  }
}
