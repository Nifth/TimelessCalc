<script lang="ts">
  import { searchStore } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import { URLS } from "$lib/constants/urls";
  import { canvas } from "$lib/canvas/canvasContext";
  import {
    getSeedsPerPage,
    buildTradeQuery,
  } from "$lib/utils/sidebar/tradeQuery";
  import TradeButton from "$lib/ui/common/TradeButton.svelte";
  import ExportButton from "$lib/ui/common/ExportButton.svelte";
  import { exportJewelToPobFormat } from "$lib/utils/export/jewelExporter";
  import { copyToClipboard } from "$lib/utils/sharing/shareUtils";
  import { showNotification } from "$lib/stores/notificationStore";

  import type { Translation } from "$lib/types";

  interface Props {
    expandedGroups: Record<number, boolean>;
    groupPages: Record<string, number>;
    hasGroupTraded: Record<string, boolean>;
    translation: Record<string, Translation[]>;
    onapplyseed: (seed: number) => void;
    ongrouptrade: (total: string) => void;
    ongroupnext: (total: string) => void;
    onexpand: (total: number) => void;
  }

  let {
    expandedGroups = $bindable({}),
    groupPages = $bindable({}),
    hasGroupTraded = $bindable({}),
    translation,
    onapplyseed,
    ongrouptrade,
    ongroupnext,
    onexpand,
  }: Props = $props();

  function openTradeForSeed(seed: number) {
    const normalized =
      $searchStore.platform.toLowerCase() === "playstation"
        ? "sony"
        : $searchStore.platform.toLowerCase();
    const platform =
      $searchStore.platform === "PC" ? "" : normalized + "/";
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
    canvas.state.highlightedStatKeys = statKeys;
    canvas.state.highlightVersion = (canvas.state.highlightVersion || 0) + 1;
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

  async function handleExportSeed(seed: number) {
    try {
      const pobFormat = await exportJewelToPobFormat(
        $searchStore.jewelType!,
        seed,
        $searchStore.conqueror!,
      );
      const success = await copyToClipboard(pobFormat);

      if (success) {
        showNotification("export", `Seed ${seed} copied to clipboard!`);
      } else {
        throw new Error("Clipboard write failed");
      }
    } catch (error) {
      console.error("Export failed:", error);
      showNotification(
        "error",
        "Failed to copy. Please check browser permissions.",
      );
    }
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
        aria-expanded={expandedGroups[parseFloat(total)] ? "true" : "false"}
        aria-label="Expand group"
        onclick={() => {
          const t = parseFloat(total);
          onexpand(t);
        }}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const t = parseFloat(total);
            onexpand(t);
          }
        }}
      >
        {#if $searchStore.statsResults[total].length > 0}
          <button type="button" class="flex-1 text-left w-full h-full">
            Total weight {total} ({$searchStore.statsResults[total].length}
            {#if $searchStore.statsResults[total].length === 1}seed{:else}seeds{/if})
          </button>
          {@const groupSeeds = $searchStore.statsResults[total].map(
            (g) => g.seed,
          )}
          {@const seedsPerPage = getSeedsPerPage(
            $searchStore.jewelType!,
            $searchStore.conqueror,
          )}
          {@const currentGroupPage = groupPages[total] || 0}
          {@const maxGroupPage = Math.floor(
            (groupSeeds.length - 1) / seedsPerPage,
          )}
          <div class="flex items-center gap-2">
            <TradeButton
              onclick={(e) => {
                e.stopPropagation();
                ongrouptrade(total);
              }}
            >
              Trade
            </TradeButton>
            {#if hasGroupTraded[total] && currentGroupPage < maxGroupPage}
              <TradeButton
                onclick={(e) => {
                  e.stopPropagation();
                  ongroupnext(total);
                }}
              >
                Next
              </TradeButton>
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
            <TradeButton
              onclick={(e) => {
                e.stopPropagation();
                ongrouptrade(total);
              }}
            >
              Trade
            </TradeButton>
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
          {#each $searchStore.statsResults[total] as item, i (item.seed)}
            <div
              role="button"
              tabindex="0"
              class="w-full px-4 py-3 text-left cursor-pointer transition-all duration-200 {i % 2 === 1 ? 'bg-slate-800 hover:bg-slate-700/50' : 'bg-slate-700/40 hover:bg-slate-700/70'}"
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
                <div class="flex gap-2">
                  <ExportButton onclick={() => handleExportSeed(item.seed)} />
                  <TradeButton
                    variant="secondary"
                    onclick={(e) => {
                      e.stopPropagation();
                      openTradeForSeed(item.seed);
                    }}
                  >
                    Trade
                  </TradeButton>
                </div>
              </div>
              <div class="mt-2 space-y-1">
                {#each Object.entries(item.statCounts) as [statKey, count] (statKey)}
                  {@const stat = $searchStore.selectedStats.find(
                    (s) => s.statKey === parseInt(statKey),
                  )}
                  {@const total = item.statTotals?.[parseInt(statKey)] ?? 0}
                  {@const transEntry = translation[statKey]?.[0]}
                  {@const divider = transEntry?.divider ?? 1}
                  {@const displayTotal = total / divider}
                  {#if stat}
                    <div
                      class="text-sm text-slate-300 flex justify-between"
                      style="color: {$searchStore.statKeyColors[
                        parseInt(statKey)
                      ] || '#10B981'}"
                    >
                      <div>
                        <span>({count})</span>
                        {stat.label}
                      </div>
                      <span class="font-semibold">
                        total: [{displayTotal}]
                      </span>
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
