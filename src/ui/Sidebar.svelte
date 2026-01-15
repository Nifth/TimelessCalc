<script lang="ts">
  import { jewelTypes } from "$lib/constants/timeless";
  import type { Conqueror, JewelType, Stat, Translation } from "$lib/types";
  import { searchStore } from "$lib/stores/searchStore";
  import LeagueSelector from "$lib/ui/LeagueSelector.svelte";
  import PlatformSelector from "$lib/ui/PlatformSelector.svelte";
  import { treeStore } from "$lib/stores/treeStore";
  import jewelStatsJson from "$lib/data/jewelstats.json" with { type: "json" };
  import translationsJson from "$lib/data/translation.json" with { type: "json" };
  import {
    getConquerorOptions,
    getStatsOptions,
  } from "$lib/utils/sidebar/options";
  import { filterStats } from "$lib/utils/sidebar/sidebarUtils";
  import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
  import { applySeed } from "$lib/utils/sidebar/searchLogic";
  import { fetchLeagues } from "$lib/providers/leagues";
  import {
    buildTradeQuery,
    getSeedsPerPage,
    getPageRangeFromOrdered,
  } from "$lib/utils/sidebar/tradeQuery";
  import { canvas } from "$lib/konva/canvasContext";
  import {
    changeKeystone,
    changeRadius,
    resetHighlights,
  } from "$lib/konva/utils/jewelHighlight";
  import Konva from "konva";

  const jewelStats: Record<string, number[]> = JSON.parse(
    JSON.stringify(jewelStatsJson),
  );
  const translation: Record<string, Translation[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

  let isOpen = true;
  let mode: "seed" | "stats" | null = null;
  let showingResults = false;
  let seedSearched = false;
  let statsSearched = false;

  let seedInput: number | null = null;
  let searchValue = "";

  let showDropdown = false;
  let filteredStats: Stat[] = [];
  let inputElement: HTMLInputElement;

  let expandedGroups: Record<number, boolean> = {};
  let groupPages: Record<string, number> = {};
  let hasGroupTraded: Record<string, boolean> = {};

  let showTooltip = false;
  let hasTraded = false;
  let tooltipButton: HTMLButtonElement;

  $: conquerorOptions = getConquerorOptions($searchStore.jewelType);

  $: statOptions = getStatsOptions(
    $searchStore.jewelType,
    jewelStats,
    translation,
  );

  $: timelessStats =
    $treeStore.chosenSocket && $searchStore.searched ? getTimelessStats() : {};

  function removeStat(index: number) {
    searchStore.update((state) => {
      state.selectedStats = state.selectedStats.filter((_, i) => i !== index);
      return state;
    });
  }

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

  function highlightSearchedStats() {
    canvas.highlightLayer?.destroyChildren();

    const searchedLabels = $searchStore.selectedStats.map((s) => s.label);

    for (const node of $treeStore.allocated.values()) {
      if (node?.timelessStats?.some((stat) => searchedLabels.includes(stat))) {
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

  function nextPage() {
    const seedsPerPage = getSeedsPerPage(
      $searchStore.jewelType!,
      $searchStore.conqueror,
    );
    const maxPage = Math.floor(($searchStore.totalResults - 1) / seedsPerPage);
    searchStore.update((s) => {
      if (s.currentPage < maxPage) {
        s.currentPage++;
      }
      return s;
    });
  }

  function logNextPage() {
    const platform =
      $searchStore.platform === "PC"
        ? ""
        : $searchStore.platform.toLowerCase() + "/";
    const league = encodeURIComponent($searchStore.league);
    const nextPageNum = $searchStore.currentPage + 1;
    const query = buildTradeQuery(
      $searchStore.orderedSeeds,
      $searchStore.jewelType!,
      $searchStore.conqueror,
      nextPageNum,
    );
    console.log(query);
    const url = `https://www.pathofexile.com/trade/search/${platform}${league}?q=${encodeURIComponent(JSON.stringify(query))}`;
    console.log(url);
    window.open(url, "_blank");
  }

  function handleTrade() {
    searchStore.update((s) => {
      s.currentPage = 0;
      return s;
    });
    hasTraded = true;
    showTooltip = false;
    const platform =
      $searchStore.platform === "PC"
        ? ""
        : $searchStore.platform.toLowerCase() + "/";
    const league = encodeURIComponent($searchStore.league);
    const query = buildTradeQuery(
      $searchStore.orderedSeeds,
      $searchStore.jewelType!,
      $searchStore.conqueror,
      0,
    );
    console.log(query);
    const url = `https://www.pathofexile.com/trade/search/${platform}${league}?q=${encodeURIComponent(JSON.stringify(query))}`;
    console.log(url);
    window.open(url, "_blank");
  }

  function handleGroupTrade(total: string) {
    const groupSeeds = $searchStore.statsResults[total].map((g) => g.seed);
    groupPages = { ...groupPages, [total]: 0 };
    hasGroupTraded = { ...hasGroupTraded, [total]: true };
    const platform =
      $searchStore.platform === "PC"
        ? ""
        : $searchStore.platform.toLowerCase() + "/";
    const league = encodeURIComponent($searchStore.league);
    const query = buildTradeQuery(
      groupSeeds,
      $searchStore.jewelType!,
      $searchStore.conqueror,
      0,
    );
    console.log(query);
    const url = `https://www.pathofexile.com/trade/search/${platform}${league}?q=${encodeURIComponent(JSON.stringify(query))}`;
    console.log(url);
    window.open(url, "_blank");
  }

  function handleGroupNext(total: string) {
    const groupSeeds = $searchStore.statsResults[total].map((g) => g.seed);
    const currentPage = groupPages[total] || 0;
    const seedsPerPage = getSeedsPerPage(
      $searchStore.jewelType!,
      $searchStore.conqueror,
    );
    const maxPage = Math.floor((groupSeeds.length - 1) / seedsPerPage);
    if (currentPage < maxPage) {
      groupPages = { ...groupPages, [total]: currentPage + 1 };
      const platform =
        $searchStore.platform === "PC"
          ? ""
          : $searchStore.platform.toLowerCase() + "/";
      const league = encodeURIComponent($searchStore.league);
      const query = buildTradeQuery(
        groupSeeds,
        $searchStore.jewelType!,
        $searchStore.conqueror,
        currentPage + 1,
      );
      console.log(query);
      const url = `https://www.pathofexile.com/trade/search/${platform}${league}?q=${encodeURIComponent(JSON.stringify(query))}`;
      console.log(url);
      window.open(url, "_blank");
    }
  }

  function updateFilteredStats() {
    filteredStats = filterStats(
      searchValue,
      statOptions,
      $searchStore.selectedStats,
    );
    showDropdown = true;
  }

  function selectStat(stat: Stat) {
    if (!$searchStore.selectedStats.some((s) => s.label === stat.label)) {
      searchStore.update((state) => {
        state.selectedStats.push({
          label: stat.label,
          statKey: stat.statKey,
          weight: 1,
          minWeight: 0,
        });
        return state;
      });
    }
    searchValue = "";
    showDropdown = false;
  }

  function handleBlur() {
    setTimeout(() => {
      showDropdown = false;
    }, 150);
  }

  async function handleSearch() {
    await performSearch(
      mode,
      seedInput,
      translation,
      $searchStore.jewelType,
      $searchStore.selectedStats,
    );
    if ($searchStore.searched) {
      if (mode === "stats") {
        statsSearched = true;
        showingResults = true;
      } else if (mode === "seed") {
        seedSearched = true;
      }
    }
  }

  function backToForm() {
    showingResults = false;
    seedInput = null;
    seedSearched = false;
    statsSearched = false;
    searchStore.update((s) => {
      s.searched = false;
      s.statsResults = {};
      s.currentPage = 0;
      s.totalResults = 0;
      s.orderedSeeds = [];
      return s;
    });
  }
  let searchTimeout: number | null = null;

  function setMode(newMode: "seed" | "stats" | null) {
    if (searchTimeout) clearTimeout(searchTimeout);
    mode = newMode;
    seedInput = null;
    if (mode === "stats") {
      fetchLeagues();
      seedSearched = false;
      statsSearched = false;
      searchStore.update((s) => {
        s.searched = false;
        s.statsResults = {};
        return s;
      });
    } else if (mode === "seed") {
      seedSearched = false;
    }
    showingResults = false;
  }

  async function applySeedFromResults(seed: number) {
    await applySeed(
      seed,
      $searchStore.jewelType!,
      $searchStore.conqueror!,
      translation,
    );
    searchStore.update((s) => {
      s.searched = true;
      s.seed = seed;
      return s;
    });
    highlightSearchedStats();
  }

  $: if (mode === "seed") {
    if (seedInput !== $searchStore.seed) {
      searchStore.update((state) => {
        state.seed = seedInput;
        return state;
      });
      if (
        seedInput &&
        seedInput >= ($searchStore.jewelType?.min || 0) &&
        seedInput <= ($searchStore.jewelType?.max || 0)
      ) {
        if (searchTimeout) window.clearTimeout(searchTimeout);
        searchTimeout = window.setTimeout(() => {
          console.log("e");
          handleSearch();
        }, 100);
      }
    }
  }

  $: {
    if (
      !conquerorOptions.some(
        (conqueror) => conqueror === $searchStore.conqueror,
      )
    ) {
      searchStore.update((state) => {
        state.searched = false;
        state.conqueror = null;
        state.selectedStats = [];
        state.seed = null;
        state.statsResults = {};
        state.minTotalWeight = 0;
        return state;
      });
      mode = null;
    }
  }
  let previousJewelType: JewelType | null = null;
  let previousConqueror: Conqueror | null = null;

  $: currentJewelType = $searchStore.jewelType;
  $: if (currentJewelType !== previousJewelType) {
    resetHighlights();
    changeRadius($treeStore.chosenSocket);
    previousJewelType = currentJewelType;
  }
  $: currentConqueror = $searchStore.conqueror;
  $: if (currentConqueror !== previousConqueror) {
    changeKeystone($treeStore.chosenSocket);
    previousConqueror = currentConqueror;
  }
</script>

<button
  on:click={() => (isOpen = !isOpen)}
  class="fixed top-4 left-4 z-50 bg-slate-800 hover:bg-slate-700 text-white w-10 h-10 rounded-lg flex flex-col justify-center items-center gap-1 cursor-pointer transition-all duration-200 shadow-lg border border-slate-600"
  aria-label="Toggle menu"
>
  <span
    class="w-5 h-0.5 bg-white rounded transition-all duration-300 {isOpen
      ? 'rotate-45 translate-y-1.5'
      : ''}"
  ></span>
  <span
    class="w-5 h-0.5 bg-white rounded transition-all duration-300 {isOpen
      ? 'opacity-0'
      : ''}"
  ></span>
  <span
    class="w-5 h-0.5 bg-white rounded transition-all duration-300 {isOpen
      ? '-rotate-45 -translate-y-1.5'
      : ''}"
  ></span>
</button>

{#if isOpen}
  <aside
    class="fixed left-0 top-0 h-screen w-[650px] bg-slate-900/95 backdrop-blur-sm p-6 overflow-y-auto shadow-2xl z-40 transition-all duration-300 ease-out border-r border-slate-700 custom-scrollbar"
  >
    <header
      class="flex items-center gap-3 pl-12 pb-4 border-b border-slate-700 relative"
    >
      {#if showingResults && mode === "stats"}
        <div class="flex gap-2 items-center">
          <div class="w-36">
            <LeagueSelector />
          </div>
          <div class="w-32">
            <PlatformSelector />
          </div>
          <button
            type="button"
            on:click={handleTrade}
            class="h-[46px] px-3 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium cursor-pointer transition-all duration-200"
          >
            Trade
          </button>
          {#if hasTraded && $searchStore.totalResults > 0}
            {@const seedsPerPage = getSeedsPerPage(
              $searchStore.jewelType!,
              $searchStore.conqueror,
            )}
            {@const maxPage = Math.floor(
              ($searchStore.totalResults - 1) / seedsPerPage,
            )}
            {#if $searchStore.currentPage < maxPage}
              <button
                type="button"
                on:click={() => {
                  nextPage();
                  logNextPage();
                }}
                class="h-[46px] px-3 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium cursor-pointer transition-all duration-200"
              >
                Next
              </button>
            {/if}
          {/if}
          <button
            type="button"
            bind:this={tooltipButton}
            on:mouseenter={() => (showTooltip = true)}
            on:mouseleave={() => (showTooltip = false)}
            class="h-[46px] px-3 rounded-lg bg-blue-900/50 hover:bg-blue-800/50 text-blue-200 text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center border border-blue-700/50"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      {:else if !showingResults}
        <span
          class="text-sm font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
          >Jewel Type</span
        >
      {/if}
    </header>

    <div class="pt-4">
      {#if showingResults}
        <div class="space-y-4">
          <button
            on:click={backToForm}
            class="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Search
          </button>

          {#if mode === "stats" && statsSearched && Object.keys($searchStore.statsResults).length > 0}
            <div class="space-y-3">
              <h3 class="text-lg font-semibold text-white">Search Results</h3>
              {#each Object.keys($searchStore.statsResults).sort((a, b) => parseFloat(b) - parseFloat(a)) as total (total)}
                <div class="bg-slate-800 rounded-lg overflow-hidden">
                  <div
                    class="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white text-left font-medium cursor-pointer transition-all duration-200 flex items-center justify-between"
                  >
                    {#if $searchStore.statsResults[total].length > 0}
                      {@const firstItem = $searchStore.statsResults[total][0]}
                      {@const modifiedNodesCount = Object.values(
                        firstItem.statCounts,
                      ).reduce((sum, count) => sum + count, 0)}

                      <button
                        type="button"
                        class="flex-1 text-left"
                        on:click={() => {
                          const t = parseFloat(total);
                          expandedGroups[t] = !expandedGroups[t];
                          expandedGroups = { ...expandedGroups };
                        }}
                      >
                        {#if $searchStore.minTotalWeight > 0}
                          Weight {total} ({$searchStore.statsResults[total]
                            .length} results)
                        {:else}
                          {modifiedNodesCount} matches ({$searchStore
                            .statsResults[total].length} results)
                        {/if}
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
                        <button
                          type="button"
                          on:click={() => handleGroupTrade(total)}
                          class="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition-all duration-200"
                        >
                          Trade
                        </button>
                        {#if hasGroupTraded[total] && currentGroupPage < maxGroupPage}
                          <button
                            type="button"
                            on:click={() => handleGroupNext(total)}
                            class="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition-all duration-200"
                          >
                            Next
                          </button>
                        {/if}
                        <button
                          type="button"
                          on:click={() => {
                            const t = parseFloat(total);
                            expandedGroups[t] = !expandedGroups[t];
                            expandedGroups = { ...expandedGroups };
                          }}
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
                        class="flex-1 text-left"
                        on:click={() => {
                          const t = parseFloat(total);
                          expandedGroups[t] = !expandedGroups[t];
                          expandedGroups = { ...expandedGroups };
                        }}
                      >
                        0 matches (0 results)
                      </button>
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          on:click={() => handleGroupTrade(total)}
                          class="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition-all duration-200"
                        >
                          Trade
                        </button>
                        <button
                          type="button"
                          on:click={() => {
                            const t = parseFloat(total);
                            expandedGroups[t] = !expandedGroups[t];
                            expandedGroups = { ...expandedGroups };
                          }}
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
                        <button
                          class="w-full px-4 py-3 text-left hover:bg-slate-700/50 cursor-pointer transition-all duration-200"
                          on:click={() => applySeedFromResults(item.seed)}
                        >
                          <div class="flex items-center justify-between">
                            <span class="font-semibold text-blue-300"
                              >Seed: {item.seed}</span
                            >
                          </div>
                          <div class="mt-2 space-y-1">
                            {#each Object.entries(item.statCounts) as [statKey, count] (statKey)}
                              {@const stat = $searchStore.selectedStats.find(
                                (s) => s.statKey === parseInt(statKey),
                              )}
                              {#if stat}
                                <div class="text-sm text-slate-300">
                                  <span class="text-blue-400">({count})</span>
                                  {stat.label}
                                </div>
                              {/if}
                            {/each}
                          </div>
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {:else if mode === "seed" && seedSearched}
            <div class="bg-slate-800 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-white mb-2">
                Seed Applied
              </h3>
              <p class="text-slate-300">
                Seed {$searchStore.seed} has been applied successfully.
              </p>
            </div>
          {:else}
            <div class="bg-slate-800 rounded-lg p-8 text-center">
              <p class="text-slate-400 italic">No results to display.</p>
            </div>
          {/if}

          {#if mode === "seed" && seedSearched && Object.keys(timelessStats).length > 0}
            <div class="bg-slate-800 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-white mb-3">
                Current Stats
              </h4>
              <div class="space-y-2">
                {#each Object.entries(timelessStats) as [stat, count] (stat)}
                  <button
                    class="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-700 rounded cursor-pointer transition-all duration-200 text-sm"
                    on:click={() => highlightNodesWithStat(stat)}
                  >
                    <span class="text-blue-400">({count})</span>
                    {stat}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="space-y-6">
          <section>
            <div class="grid grid-cols-5 gap-3 items-stretch">
              {#each jewelTypes as jewelType (jewelType.name)}
                <label class="relative cursor-pointer h-full">
                  <input
                    type="radio"
                    bind:group={$searchStore.jewelType}
                    value={jewelType}
                    class="sr-only"
                  />
                  <div
                    class="flex items-center justify-center px-4 py-3 rounded-lg border-2 text-center transition-all duration-200 h-full {$searchStore.jewelType ===
                    jewelType
                      ? 'border-blue-400 bg-slate-700/50 text-white shadow-lg shadow-blue-500/10'
                      : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700'}"
                  >
                    <span class="font-medium">{jewelType.label}</span>
                  </div>
                </label>
              {/each}
            </div>
          </section>

          {#if $searchStore.jewelType}
            <section>
              <h2
                class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3"
              >
                Conqueror
              </h2>
              <div class="grid grid-cols-4 gap-2">
                {#each conquerorOptions as conqueror (conqueror.label)}
                  <label class="relative cursor-pointer">
                    <input
                      type="radio"
                      bind:group={$searchStore.conqueror}
                      value={conqueror}
                      class="sr-only"
                    />
                    <div
                      class="px-2 py-2 rounded-lg border-2 text-center text-sm transition-all duration-200 {$searchStore.conqueror ===
                      conqueror
                        ? 'border-blue-400 bg-slate-700/50 text-white shadow-lg shadow-blue-500/10'
                        : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700'}"
                    >
                      <span class="font-medium">{conqueror.label}</span>
                    </div>
                  </label>
                {/each}
              </div>
            </section>

            {#if $searchStore.conqueror}
              <section>
                <div class="flex gap-2">
                  <button
                    on:click={() => setMode("seed")}
                    class="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 {$searchStore.jewelType
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed'} {mode === 'seed'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}"
                    disabled={!$searchStore.jewelType}
                  >
                    Enter Seed
                  </button>
                  <button
                    on:click={() => setMode("stats")}
                    class="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 {$searchStore.jewelType
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed'} {mode === 'stats'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}"
                    disabled={!$searchStore.jewelType}
                  >
                    Select Stats
                  </button>
                </div>
              </section>

              {#if mode === "seed"}
                <div class="space-y-3">
                  <input
                    type="number"
                    bind:value={seedInput}
                    placeholder="Enter the seed"
                    min="0"
                    step="1"
                    class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  />
                  <p class="text-sm text-slate-400">
                    From {$searchStore.jewelType.min} to {$searchStore.jewelType
                      .max}
                  </p>

                  {#if mode === "seed" && $searchStore.searched && Object.keys(timelessStats).length > 0}
                    <div class="bg-slate-800 rounded-lg p-4">
                      <h4 class="text-sm font-semibold text-white mb-3">
                        Current Stats
                      </h4>
                      <div class="space-y-2">
                        {#each Object.entries(timelessStats) as [stat, count] (stat)}
                          <button
                            class="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-700 rounded cursor-pointer transition-all duration-200 text-sm"
                            on:click={() => highlightNodesWithStat(stat)}
                          >
                            <span class="text-blue-400">({count})</span>
                            {stat}
                          </button>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}

              {#if mode === "stats"}
                <div class="space-y-4">
                  <div class="relative">
                    <input
                      bind:this={inputElement}
                      type="text"
                      bind:value={searchValue}
                      placeholder="Search for a stat..."
                      on:input={updateFilteredStats}
                      on:focus={() => {
                        updateFilteredStats();
                      }}
                      on:click={() => {
                        if (!searchValue.trim()) {
                          updateFilteredStats();
                        }
                      }}
                      on:blur={handleBlur}
                      class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                    />

                    {#if showDropdown}
                      <div
                        class="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto"
                      >
                        {#if filteredStats.length > 0}
                          {#each filteredStats as stat (stat.statKey)}
                            <button
                              class="w-full px-4 py-3 text-left text-slate-200 hover:bg-blue-600 hover:text-white cursor-pointer transition-all duration-150 border-b border-slate-700 last:border-b-0"
                              on:mousedown|preventDefault={() =>
                                selectStat(stat)}
                            >
                              {stat.label}
                            </button>
                          {/each}
                        {:else if searchValue}
                          <div class="px-4 py-3 text-slate-400 italic">
                            No stats found
                          </div>
                        {:else}
                          <div class="px-4 py-3 text-slate-400 italic">
                            Type to search...
                          </div>
                        {/if}
                      </div>
                    {/if}
                  </div>

                  <div class="space-y-2">
                    {#each $searchStore.selectedStats as stat, i (i)}
                      <div
                        class="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg"
                      >
                        <span class="flex-1 text-sm text-slate-200 truncate"
                          >{stat.label}</span
                        >
                        <input
                          type="number"
                          bind:value={stat.weight}
                          placeholder="Weight"
                          min="0"
                          step="0.1"
                          class="w-16 px-2 py-1.5 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-400"
                        />
                        <input
                          type="number"
                          bind:value={stat.minWeight}
                          placeholder="Min"
                          min="0"
                          step="0.1"
                          class="w-16 px-2 py-1.5 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-400"
                        />
                        <button
                          on:click={() => removeStat(i)}
                          aria-label="Remove stat"
                          class="px-2 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded cursor-pointer transition-all duration-200"
                        >
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    {/each}
                    {#if $searchStore.selectedStats.length === 0}
                      <p class="text-sm text-slate-400 italic text-center py-4">
                        No stats selected
                      </p>
                    {/if}
                  </div>

                  {#if $searchStore.selectedStats.length > 0}
                    <div class="flex items-center gap-3">
                      <label
                        for="minTotalWeight"
                        class="text-sm text-slate-300 whitespace-nowrap"
                      >
                        Min total weight (0 = auto):
                      </label>
                      <input
                        id="minTotalWeight"
                        type="number"
                        bind:value={$searchStore.minTotalWeight}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        class="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  {/if}
                </div>
              {/if}

              {#if mode === "stats"}
                <button
                  on:click={handleSearch}
                  class="w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold text-lg cursor-pointer transition-all duration-200 shadow-lg shadow-green-500/20"
                >
                  Search
                </button>
              {/if}
            {/if}
          {/if}
        </div>
      {/if}
    </div>
  </aside>
  {#if showTooltip && tooltipButton}
    {@const pageInfo = getPageRangeFromOrdered(
      $searchStore.orderedSeeds,
      $searchStore.currentPage,
      $searchStore.jewelType!,
      $searchStore.conqueror,
    )}
    {@const rect = tooltipButton.getBoundingClientRect()}
    <div
      class="fixed z-[100] w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl text-sm text-slate-200"
      style="top: {(rect?.top || 60) + 50}px; left: {(rect?.left || 200) +
        30}px"
    >
      <p class="font-semibold mb-2">Trade Link Pagination</p>
      <p class="mb-2">
        Maximum 10 filters per query. Seeds are grouped into ranges (e.g.,
        10020-10022) to maximize filter usage. Results are ordered by weight
        (best matches first).
      </p>
      <p>
        {#if pageInfo.count > 0}
          {@const seedsPerPage = getSeedsPerPage(
            $searchStore.jewelType!,
            $searchStore.conqueror,
          )}
          {@const startNum = $searchStore.currentPage * seedsPerPage + 1}
          {@const endNum = Math.min(
            startNum + seedsPerPage - 1,
            $searchStore.totalResults,
          )}
          Showing seeds {startNum}-{endNum} of {$searchStore.totalResults}
        {:else}
          No results to display
        {/if}
      </p>
    </div>
  {/if}
{/if}
