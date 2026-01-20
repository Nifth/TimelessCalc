<script lang="ts">

   import { searchStore } from "$lib/stores/searchStore";
   import { treeStore } from "$lib/stores/treeStore";
   import { URLS } from "$lib/constants/urls";
  import { canvas } from "$lib/konva/canvasContext";
  import {
    getSeedsPerPage,
    buildTradeQuery,
  } from "$lib/utils/sidebar/tradeQuery";
  import Konva from "konva";

  interface Props {
    expandedGroups: Record<number, boolean>;
    groupPages: Record<string, number>;
    hasGroupTraded: Record<string, boolean>;
    onapplyseed: (seed: number) => void;
    ongrouptrade: (total: string) => void;
    ongroupnext: (total: string) => void;
    onexpand: (total: number) => void;
  }

  let {
    expandedGroups = $bindable({}),
    groupPages = $bindable({}),
    hasGroupTraded = $bindable({}),
    onapplyseed,
    ongrouptrade,
    ongroupnext,
    onexpand,
  }: Props = $props();

  function openTradeForSeed(seed: number) {
    const platform =
      $searchStore.platform === "PC"
        ? ""
        : $searchStore.platform.toLowerCase() + "/";
    const league = encodeURIComponent($searchStore.league);
    const query = buildTradeQuery(
      [seed],
      $searchStore.jewelType!,
      $searchStore.conqueror,
      0,
    );
    // Todo: move pattern to constants file and use replace to build the url
    const url = `${URLS.POE_TRADE_SEARCH}${platform}${league}?q=${encodeURIComponent(JSON.stringify(query))}`;
    window.open(url, "_blank");
  }

  function highlightNodesWithStatKeys(statKeys: number[]) {
    canvas.highlightLayer?.destroyChildren();

    for (const node of $treeStore.allocated.values()) {
      if (node?.timelessStatKeys?.some((key) => statKeys.includes(key))) {
        const circle = new Konva.Circle({
          x: node.x,
          y: node.y,
          radius: node.isNotable ? 70 : 50,
          stroke: "yellow", // todo: Make a random color per stat key
          strokeWidth: 10,
        });
        canvas.highlightLayer?.add(circle);
      }
    }

    canvas.highlightLayer?.batchDraw();
  }

  async function handleSeedClick(item: {
    seed: number;
    statCounts: Record<number, number>;
    statTotals: Record<number, number>;
  }) {
    await onapplyseed(item.seed);
    setTimeout(() => {
      const statKeys = Object.keys(item.statCounts).map((k) => parseInt(k));
      highlightNodesWithStatKeys(statKeys);
    }, 50);
  }
</script>

<div class="space-y-3">
  <h3 class="text-lg font-semibold text-white">Search Results</h3>
  {#each Object.keys($searchStore.statsResults).sort((a, b) => parseFloat(b) - parseFloat(a)) as total (total)}
    <div class="bg-slate-800 rounded-lg overflow-hidden">
      <div
        class="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white text-left font-medium transition-all duration-200 flex items-center justify-between"
        role="button"
        tabindex="0"
        aria-expanded={expandedGroups[parseFloat(total)] ? 'true' : 'false'}
        aria-label="Expand group"
        onclick={() => {
          const t = parseFloat(total);
          onexpand(t);
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const t = parseFloat(total);
            onexpand(t);
          }
        }}
      >
        {#if $searchStore.statsResults[total].length > 0}
          {@const firstItem = $searchStore.statsResults[total][0]}
          {@const modifiedNodesCount = Object.values(
            firstItem.statCounts,
          ).reduce((sum, count) => sum + count, 0)}

          <button
            type="button"
            class="flex-1 text-left w-full h-full"
          >
            {#if $searchStore.minTotalWeight > 0}
              Weight {total} ({$searchStore.statsResults[total].length} results)
            {:else}
              {modifiedNodesCount} matches ({$searchStore.statsResults[total]
                .length} results)
            {/if}
          </button>
          {@const groupSeeds = $searchStore.statsResults[total].map(
            (g) => g.seed,
          )}
           {@const seedsPerPage = getSeedsPerPage($searchStore.jewelType!, $searchStore.conqueror)}
          {@const currentGroupPage = groupPages[total] || 0}
          {@const maxGroupPage = Math.floor(
            (groupSeeds.length - 1) / seedsPerPage,
          )}
          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick={(e) => {
                e.stopPropagation();
                ongrouptrade(total);
              }}
              class="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition-all duration-200"
            >
              Trade
            </button>
            {#if hasGroupTraded[total] && currentGroupPage < maxGroupPage}
              <button
                type="button"
                onclick={(e) => {
                  e.stopPropagation();
                  ongroupnext(total);
                }}
                class="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition-all duration-200"
              >
                Next
              </button>
            {/if}
            <button
              type="button"
              onclick={(e) => {
                e.stopPropagation();
                const t = parseFloat(total);
                onexpand(t);
              }}
              aria-label="Expand group"
              class="p-0.5 rounded hover:bg-slate-600 transition-all duration-200"
            >
              <svg
                class="w-4 h-4 transition-transform duration-200 {expandedGroups[
                  parseFloat(total)
                ]
                  ? 'rotate-180'
                  : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        {:else}
          <button
            type="button"
            class="flex-1 text-left w-full h-full"
            aria-label="Expand group"
          >
            0 matches (0 results)
          </button>
          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick={(e) => {
                e.stopPropagation();
                ongrouptrade(total);
              }}
              class="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition-all duration-200"
            >
              Trade
            </button>
            <button
              type="button"
              onclick={(e) => {
                e.stopPropagation();
                const t = parseFloat(total);
                onexpand(t);
              }}
              aria-label="Expand group"
              class="p-0.5 rounded hover:bg-slate-600 transition-all duration-200"
            >
              <svg
                class="w-4 h-4 transition-transform duration-200 {expandedGroups[
                  parseFloat(total)
                ]
                  ? 'rotate-180'
                  : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        {/if}
      </div>
      {#if expandedGroups[parseFloat(total)]}
        <div class="divide-y divide-slate-700">
          {#each $searchStore.statsResults[total] as item (item.seed)}
            <div
              role="button"
              tabindex="0"
              class="w-full px-4 py-3 text-left hover:bg-slate-700/50 cursor-pointer transition-all duration-200"
              onclick={() => handleSeedClick(item)}
              onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSeedClick(item);
                }
              }}
            >
              <div class="flex items-center justify-between">
                <span class="font-semibold text-blue-300"
                  >Seed: {item.seed}</span
                >
                <button
                  type="button"
                  onclick={(e) => {
                    e.stopPropagation();
                    openTradeForSeed(item.seed);
                  }}
                  class="px-2 py-1 rounded bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 text-xs font-medium cursor-pointer transition-all duration-200"
                >
                  Trade
                </button>
              </div>
              <div class="mt-2 space-y-1">
                {#each Object.entries(item.statCounts) as [statKey, count] (statKey)}
                  {@const stat = $searchStore.selectedStats.find(
                    (s) => s.statKey === parseInt(statKey),
                  )}
                  {@const total = item.statTotals?.[parseInt(statKey)] ?? 0}
                  {#if stat}
                    <div class="text-sm text-slate-300 flex justify-between">
                      <div>
                        <span class="text-blue-400">({count})</span>
                        {stat.label}
                      </div>
                      <!-- TODO: use the same random color as used for the circle highlight -->
                      <span class="text-green-400 font-semibold">[{total}]</span
                      >
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>
