<script lang="ts">
  import type { JewelType } from "$lib/types";
  import { searchStore } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import { canvas } from "$lib/konva/canvasContext";
  import Konva from "konva";

  interface Props {
    jewelType: JewelType | null;
    seed: number | null;
    onapplyseed: (seed: number) => void;
  }

  let { jewelType, seed = $bindable(null), onapplyseed }: Props = $props();

  let seedInput: number | null = $state(null);
  let searchTimeout: number | null = $state(null);

  function getTimelessStats(): Record<string, number> {
    const chosenSocket = $treeStore.chosenSocket;
    if (!chosenSocket) return {};

    const statsCount: Record<string, number> = {};

    for (const node of $treeStore.allocated.values()) {
      if (node?.timelessStats) {
        for (const stat of node.timelessStats) {
          if (node.stats?.includes(stat)) continue;
          statsCount[stat] = (statsCount[stat] || 0) + 1;
        }
      }
    }

    return statsCount;
  }

  function highlightNodesWithStat(stat: string) {
    canvas.highlightLayer?.destroyChildren();

    for (const node of $treeStore.allocated.values()) {
      if (node?.timelessStats?.includes(stat)) {
        const circle = new Konva.Circle({
          x: node.x,
          y: node.y,
          radius: node.isNotable ? 70 : 50,
          stroke: "yellow",
          strokeWidth: 10,
        });
        canvas.highlightLayer?.add(circle);
      }
    }

    canvas.highlightLayer?.batchDraw();
  }

  function handleInput() {
    if (searchTimeout) window.clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(() => {
      if (
        seedInput &&
        seedInput >= (jewelType?.min || 0) &&
        seedInput <= (jewelType?.max || 0)
      ) {
        onapplyseed(seedInput);
      }
    }, 100);
  }

  let timelessStats = $derived(
    $treeStore.chosenSocket && $searchStore.searched ? getTimelessStats() : {},
  );
</script>

<div class="space-y-3">
  <input
    type="number"
    bind:value={seedInput}
    oninput={handleInput}
    placeholder="Enter the seed"
    min="0"
    step="1"
    class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
  />
  <p class="text-sm text-slate-400">
    From {jewelType?.min} to {jewelType?.max}
  </p>

  {#if $searchStore.seedSearched && Object.keys(timelessStats).length > 0}
    <div class="bg-slate-800 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-white mb-3">Current Stats</h4>
      <div class="space-y-2">
        {#each Object.entries(timelessStats) as [stat, count] (stat)}
          <button
            class="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-700 rounded cursor-pointer transition-all duration-200 text-sm"
            onclick={() => highlightNodesWithStat(stat)}
          >
            <span class="text-blue-400">({count})</span>
            {stat}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
