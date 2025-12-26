import { treeStore } from "$lib/stores/treeStore";
import { getJewelData, preloadJewels } from "$lib/providers/jewels";
import { canvas } from "$lib/konva/canvasContext";
import { parseKey, getTranslation } from "./sidebarUtils";
import type { JewelType, Conqueror, Stat, Translation } from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";

export async function handleSearch(
  mode: "seed" | "stats" | null,
  seedInput: number | null,
  translation: Record<string, Translation[]>,
  jewelType: JewelType | null,
  conqueror: Conqueror | null,
  seed: number | null,
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
  } else {
    // Pour le mode stats, on peut implémenter plus tard
    console.log("Submit:", {
      line1: jewelType,
      line2: conqueror,
      mode,
      seed,
      stats: selectedStats,
    });
    alert("Recherche lancée ! (voir console)");
  }
}
