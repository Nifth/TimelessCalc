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

  // Appliquer les modifications aux nodes
  treeStore.update((state) => {
    const chosenSocket = state.chosenSocket?.skill;
    if (!chosenSocket) {
      alert("No jewel socket selected");
      return state;
    }
    const socketNodeIds = canvas.treeData.socketNodes[chosenSocket];
    // Traiter les remplacements (r)
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
    // Traiter les ajouts (a)
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
    // Appliquer les effets de base selon le jewelType
    if (jewelType) {
      const label = jewelType.name;
      let baseStat = "";
      if (label === "karui") {
        baseStat = "+2 to Strength";
      } else if (label === "maraketh") {
        baseStat = "+2 to Dexterity";
      } else if (label === "templar") {
        baseStat = "+5 to Devotion";
      } else if (label === "eternal") {
        baseStat = "void";
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
              node.timelessStats.push(baseStat);
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
    // Assurer que les données sont chargées
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

    // Appliquer les modifications aux nodes
    treeStore.update((state) => {
      const chosenSocket = state.chosenSocket?.skill;
      if (!chosenSocket) {
        alert("No jewel socket selected");
        return state;
      }
      const socketNodeIds = canvas.treeData.socketNodes[chosenSocket];
      // Traiter les remplacements (r)
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
      // Traiter les ajouts (a)
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
      // Appliquer les effets de base selon le jewelType
      if (jewelType) {
        const label = jewelType.name;
        let baseStat = "";
        if (label === "karui") {
          baseStat = "+2 to Strength";
        } else if (label === "maraketh") {
          baseStat = "+2 to Dexterity";
        } else if (label === "templar") {
          baseStat = "+5 to Devotion";
        } else if (label === "eternal") {
          baseStat = "void";
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
                node.timelessStats.push(baseStat);
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
    // Assurer que les données sont chargées
    await preloadJewels();
    const jewelData = getJewelData(jewelType!.name);
    if (!jewelData) {
      return;
    }
    // Résultats : pour chaque seed, compter les occurrences de chaque stat sélectionnée sur les nodes alloués
    const results: Record<number, Record<number, number>> = {};

    for (const seedStr of Object.keys(jewelData)) {
      const seed = parseInt(seedStr);
      const entry = jewelData[seed];
      if (!entry) continue;

      const statCounts: Record<number, number> = {};

      // Traiter 'r' et 'a'
      for (const type of ['r', 'a'] as const) {
        for (const [key, nodeIds] of Object.entries(entry[type] || {})) {
          const stats = parseKey(key);
          for (const { statId } of stats) {
            if (selectedStats.some(s => s.statKey === statId)) {
              // Compter pour chaque nodeId alloué
              for (const nodeId of nodeIds) {
                if (get(treeStore).allocated.has(nodeId.toString())) {
                  statCounts[statId] = (statCounts[statId] || 0) + 1;
                }
              }
            }
          }
        }
      }

      // Si au moins une stat a un count > 0, ajouter au résultats
      if (Object.values(statCounts).some(count => count > 0)) {
        results[seed] = statCounts;
      }
    }

    // Grouper par poids total
    const grouped: Record<string, {seed: number, statCounts: Record<number, number>, totalWeight: number}[]> = {};
    for (const [seed, statCounts] of Object.entries(results)) {
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
        grouped[key].push({seed: parseInt(seed), statCounts, totalWeight});
      }
    }

    // Pour l'instant, log les résultats
    console.log("Stats search results:", grouped);

    // TODO: Mettre à jour un store ou afficher dans l'UI
    searchStore.update((state) => {
      state.searched = true;
      state.statsResults = grouped;
      return state;
    });
  }
}
