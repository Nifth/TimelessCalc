<script lang="ts">
  import { searchStore } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import { canvas } from "$lib/canvas/canvasContext";
  import { get } from "svelte/store";
  import { translations } from "$lib/providers/translations";
  import { formatStatTranslation } from "$lib/utils/sidebar/sidebarUtils";

  interface Props {
    seed: number | null;
    onapplyseed: (seed: number) => void;
  }

  let { seed = $bindable(null), onapplyseed }: Props = $props();

  const jewelType = get(searchStore).jewelType;
  let seedInput: number | null = $state(null);
  let searchTimeout: number | null = $state(null);

  function getTimelessStats(): Record<
    number,
    { count: number; total: number }
  > {
    const chosenSocket = $treeStore.chosenSocket;
    if (!chosenSocket) return {};
    const statData: Record<number, { count: number; total: number }> = {};
    for (const node of $treeStore.allocated.values()) {
      if (node?.timelessStatKeys && node?.timelessStatValues) {
        for (let i = 0; i < node.timelessStatKeys.length; i++) {
          const statKey = node.timelessStatKeys[i];
          const value = node.timelessStatValues[i];

          const statEntry = translations[statKey.toString()]?.[0];
          if (statEntry && node.stats) {
            const statLabel = formatStatTranslation(
              statKey,
              value,
              translations,
            );
            if (node.stats.includes(statLabel)) continue;
          }

          if (!statData[statKey]) {
            statData[statKey] = { count: 0, total: 0 };
          }
          statData[statKey].count++;
          statData[statKey].total += value;
        }
      }
    }
    return statData;
  }

  function highlightNodesWithStat(statKey: number) {
    canvas.state.highlightedStatKeys = [statKey];
    canvas.state.highlightVersion = (canvas.state.highlightVersion || 0) + 1;
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
    $treeStore.chosenSocket && $searchStore.seedSearched
      ? getTimelessStats()
      : {},
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
      <div>
        {#each Object.entries(timelessStats) as [statKeyStr, data] (statKeyStr)}
          {@const statKey = parseInt(statKeyStr)}
          {@const transEntry = translations[statKeyStr]?.[0]}
          {@const divider = transEntry?.divider ?? 1}
          {@const displayTotal = data.total / divider}
          {@const translation =
            transEntry?.translation?.replace("{0}", "#") || statKey}

          <button
            class="w-full px-3 py-1 hover:bg-slate-700 rounded cursor-pointer transition-all duration-200 text-sm"
            onclick={() => highlightNodesWithStat(statKey)}
          >
            <div class="flex justify-between text-slate-300">
              <div>
                <span class="text-blue-400">({data.count})</span>
                {translation}
              </div>
              <span class="font-semibold">total: [{displayTotal}]</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
