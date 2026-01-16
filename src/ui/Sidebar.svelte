<script lang="ts">
  import type { Translation, Node } from "$lib/types";
  import { searchStore } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import { canvas } from "$lib/konva/canvasContext";
  import LeagueSelector from "$lib/ui/LeagueSelector.svelte";
  import PlatformSelector from "$lib/ui/PlatformSelector.svelte";
  import TradeNotification from "$lib/ui/TradeNotification.svelte";
  import {
    getConquerorOptions,
  } from "$lib/utils/sidebar/options";
  import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
  import { applySeed } from "$lib/utils/sidebar/searchLogic";
  import { fetchLeagues } from "$lib/providers/leagues";
  import {
    buildTradeQuery,
    getSeedsPerPage,
    getPageRangeFromOrdered,
    MAX_FILTERS,
  } from "$lib/utils/sidebar/tradeQuery";
  import translationsJson from "$lib/data/translation.json" with { type: "json" };
  import SidebarToggle from "./SidebarToggle.svelte";
  import JewelTypeSelector from "./JewelTypeSelector.svelte";
  import ConquerorSelector from "./ConquerorSelector.svelte";
  import ModeSelector from "./ModeSelector.svelte";
  import SeedSearch from "./SeedSearch.svelte";
  import StatsSearch from "./StatsSearch.svelte";
  import StatsResults from "./StatsResults.svelte";
  import TradeControls from "./TradeControls.svelte";
  import BackButton from "./BackButton.svelte";
  import SeedResultDisplay from "./SeedResultDisplay.svelte";
  import NodeToggles from "./NodeToggles.svelte";

  const translation: Record<string, Translation[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

  let isOpen = $state(true);
  let mode: "seed" | "stats" | null = $state(null);
  let showingResults = $state(false);
  let seedSearched = $state(false);
  let statsSearched = $state(false);
  let seedInput: number | null = $state(null);

  let expandedGroups: Record<number, boolean> = $state({});
  let groupPages: Record<string, number> = $state({});
  let hasGroupTraded: Record<string, boolean> = $state({});
  let _hasTraded = $state(false);
  let tooltipPosition: { top: number; left: number } | null = $state(null);

  let conquerorOptions = $derived(getConquerorOptions($searchStore.jewelType));

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

  function storeTradeInfo(seeds: number[], page: number, groupName?: string) {
    const filtersPerPage = getSeedsPerPage(
      $searchStore.jewelType!,
      $searchStore.conqueror,
    );
    if (seeds.length < filtersPerPage) return;

    const conquerorLabel = $searchStore.conqueror?.label || "Any";
    searchStore.update((s) => ({
      ...s,
      lastTradeInfo: { seeds, conquerorLabel, page, groupName },
    }));
  }

  function logNextPage() {
    const platform =
      $searchStore.platform === "PC"
        ? ""
        : $searchStore.platform.toLowerCase() + "/";
    const league = encodeURIComponent($searchStore.league);
    const nextPageNum = $searchStore.currentPage;
    const seedsPerPage = getSeedsPerPage(
      $searchStore.jewelType!,
      $searchStore.conqueror,
    );
    const startIdx = nextPageNum * seedsPerPage;
    const endIdx = Math.min(
      startIdx + seedsPerPage,
      $searchStore.orderedSeeds.length,
    );
    const pageSeeds = $searchStore.orderedSeeds.slice(startIdx, endIdx);
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
    storeTradeInfo(pageSeeds, nextPageNum);
  }

  function handleTrade() {
    searchStore.update((s) => {
      s.currentPage = 0;
      return s;
    });
    _hasTraded = true;
    const platform =
      $searchStore.platform === "PC"
        ? ""
        : $searchStore.platform.toLowerCase() + "/";
    const league = encodeURIComponent($searchStore.league);
    const seedsPerPage = getSeedsPerPage(
      $searchStore.jewelType!,
      $searchStore.conqueror,
    );
    const pageSeeds = $searchStore.orderedSeeds.slice(0, seedsPerPage);
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
    storeTradeInfo(pageSeeds, 0);
  }

  function handleGroupTrade(total: string) {
    const groupSeeds = $searchStore.statsResults[total].map((g) => g.seed);
    const seedsPerPage = getSeedsPerPage(
      $searchStore.jewelType!,
      $searchStore.conqueror,
    );
    const pageSeeds = groupSeeds.slice(0, seedsPerPage);
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
    storeTradeInfo(pageSeeds, 0, total);
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
      const nextPage = currentPage + 1;
      const startIdx = nextPage * seedsPerPage;
      const endIdx = Math.min(startIdx + seedsPerPage, groupSeeds.length);
      const pageSeeds = groupSeeds.slice(startIdx, endIdx);
      groupPages = { ...groupPages, [total]: nextPage };
      const platform =
        $searchStore.platform === "PC"
          ? ""
          : $searchStore.platform.toLowerCase() + "/";
      const league = encodeURIComponent($searchStore.league);
      const query = buildTradeQuery(
        groupSeeds,
        $searchStore.jewelType!,
        $searchStore.conqueror,
        nextPage,
      );
      console.log(query);
      const url = `https://www.pathofexile.com/trade/search/${platform}${league}?q=${encodeURIComponent(JSON.stringify(query))}`;
      console.log(url);
      window.open(url, "_blank");
      storeTradeInfo(pageSeeds, nextPage, total);
    }
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

  function setMode(newMode: "seed" | "stats" | null) {
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
  }

  function handleSeedInput(newSeed: number) {
    seedInput = newSeed;
    searchStore.update((state) => {
      state.seed = newSeed;
      return state;
    });
    if (
      newSeed >= ($searchStore.jewelType?.min || 0) &&
      newSeed <= ($searchStore.jewelType?.max || 0)
    ) {
      handleSearch();
    }
  }

  function expandGroup(total: number) {
    expandedGroups = { ...expandedGroups, [total]: !expandedGroups[total] };
  }
</script>

<SidebarToggle bind:isOpen />

{#if isOpen}
  <aside
    class="fixed left-0 top-0 h-screen w-[650px] bg-slate-900/95 backdrop-blur-sm p-6 overflow-y-auto shadow-2xl z-40 transition-all duration-300 ease-out border-r border-slate-700 custom-scrollbar"
  >
    <header
      class="flex items-center gap-3 pl-12 pb-4 border-b border-slate-700 relative"
    >
      {#if showingResults && mode === "stats"}
        <TradeControls
          jewelType={$searchStore.jewelType}
          conqueror={$searchStore.conqueror}
          hasTraded={_hasTraded}
          ontrade={handleTrade}
          onnext={() => {
            nextPage();
            logNextPage();
          }}
          ontargetposition={(pos) => (tooltipPosition = pos)}
        >
          <LeagueSelector slot="league" />
          <PlatformSelector slot="platform" />
        </TradeControls>
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
          <BackButton onclick={backToForm} />

          {#if mode === "stats" && statsSearched && Object.keys($searchStore.statsResults).length > 0}
            <StatsResults
              jewelType={$searchStore.jewelType}
              conqueror={$searchStore.conqueror}
              bind:expandedGroups
              bind:groupPages
              bind:hasGroupTraded
              onapplyseed={applySeedFromResults}
              ongrouptrade={handleGroupTrade}
              ongroupnext={handleGroupNext}
              onexpand={expandGroup}
            />
          {:else if mode === "seed" && seedSearched}
            <SeedResultDisplay seed={$searchStore.seed} />
          {:else}
            <div class="bg-slate-800 rounded-lg p-8 text-center">
              <p class="text-slate-400 italic">No results to display.</p>
            </div>
          {/if}
        </div>
      {:else}
        <div class="space-y-6">
          <section>
            <JewelTypeSelector bind:jewelType={$searchStore.jewelType} />
          </section>

          {#if $searchStore.jewelType}
            <section>
              <h2
                class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3"
              >
                Conqueror
              </h2>
              <ConquerorSelector
                bind:conqueror={$searchStore.conqueror}
                options={conquerorOptions}
              />
            </section>

            {#if $searchStore.conqueror}
              <section>
                <ModeSelector
                  {mode}
                  disabled={!$searchStore.jewelType}
                  onselectmode={setMode}
                />
              </section>

              {#if mode === "seed"}
                <SeedSearch
                  jewelType={$searchStore.jewelType}
                  bind:seed={seedInput}
                  onapplyseed={handleSeedInput}
                />
              {/if}

              {#if mode === "stats"}
                <StatsSearch
                  jewelType={$searchStore.jewelType}
                />
                <button
                  onclick={handleSearch}
                  class="w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold text-lg cursor-pointer transition-all duration-200 shadow-lg shadow-green-500/20"
                >
                  Search
                </button>
              {/if}
            {/if}
          {/if}

          <NodeToggles />
        </div>
      {/if}
    </div>
  </aside>
  {#if tooltipPosition}
    {@const pageInfo = getPageRangeFromOrdered(
      $searchStore.orderedSeeds,
      $searchStore.currentPage,
      $searchStore.jewelType!,
      $searchStore.conqueror,
    )}
    <div
      class="fixed z-[100] w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl text-sm text-slate-200"
      style="top: {tooltipPosition.top}px; left: {tooltipPosition.left}px"
    >
      <p class="font-semibold mb-2">Trade Link Pagination</p>
      <p class="mb-2">
        Maximum {MAX_FILTERS} filters per query. Seeds are grouped into ranges when possible (e.g.,
        10020-10022) to maximize filter usage, allowing to have a bit more than {MAX_FILTERS} seeds in search. Results are ordered by weight
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
  {#if $searchStore.lastTradeInfo}
    <TradeNotification
      seeds={$searchStore.lastTradeInfo.seeds}
      conquerorLabel={$searchStore.lastTradeInfo.conquerorLabel}
      page={$searchStore.lastTradeInfo.page}
      groupName={$searchStore.lastTradeInfo.groupName}
      onDismiss={() =>
        searchStore.update((s) => ({ ...s, lastTradeInfo: null }))}
    />
  {/if}
{/if}
