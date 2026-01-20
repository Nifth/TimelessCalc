<script lang="ts">
  import type { Conqueror, Translation, TreeData } from "$lib/types";
  import { searchStore, resetDependentFields } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import { historyActions } from "$lib/stores/historyStore";
  import { clearHighlights } from "$lib/konva/utils/jewelHighlight";
  import LeagueSelector from "$lib/ui/LeagueSelector.svelte";
  import PlatformSelector from "$lib/ui/PlatformSelector.svelte";
  import TradeNotification from "$lib/ui/TradeNotification.svelte";
  import { conquerors } from "$lib/constants/timeless";
  import { getConquerorOptions } from "$lib/utils/sidebar/options";
  import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
  import { applySeed } from "$lib/utils/sidebar/searchLogic";

  import {
    buildTradeQuery,
    getSeedsPerPage,
    getPageRangeFromOrdered,
    MAX_FILTERS,
  } from "$lib/utils/sidebar/tradeQuery";
  import {
    generateShareUrl,
    copyToClipboard,
  } from "$lib/utils/sharing/shareUtils";
  import translationsJson from "$lib/data/translation.json" with { type: "json" };
  import treeData from "$lib/data/tree.json" with { type: "json" };
  import SidebarToggle from "./SidebarToggle.svelte";
  import JewelTypeSelector from "./JewelTypeSelector.svelte";
  import ConquerorSelector from "./ConquerorSelector.svelte";
  import ModeSelector from "./ModeSelector.svelte";
  import SeedSearch from "./SeedSearch.svelte";
  import StatsSearch from "./StatsSearch.svelte";
  import StatsResults from "./StatsResults.svelte";
  import TradeControls from "./TradeControls.svelte";

  import NodeToggles from "./NodeToggles.svelte";
  import Modal from "./Modal.svelte";
  import SearchHistory from "./SearchHistory.svelte";
  import Favorites from "./Favorites.svelte";
  import SaveFavoriteModal from "./SaveFavoriteModal.svelte";
  import FavoriteNotification from "./FavoriteNotification.svelte";
  import ShareNotification from "./ShareNotification.svelte";
  import { favoritesActions } from "$lib/stores/favoritesStore";

  const translation: Record<string, any[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

  let isOpen = $state(true);
  let seedInput: number | null = $state(null);

  let expandedGroups: Record<number, boolean> = $state({});
  let groupPages: Record<string, number> = $state({});
  let hasGroupTraded: Record<string, boolean> = $state({});
  let _hasTraded = $state(false);
  let tooltipPosition: { top: number; left: number } | null = $state(null);

  let showSaveFavoriteModal = $state(false);
  let favoriteSuggestion = $state("");
  let showFavoriteNotification = $state(false);
  let showShareNotification = $state(false);
  let favoriteNotificationName = $state("");
  let socketWarningMessage = $state("");
  let activeTab = $state<"search" | "favorites" | "history">("search");

  let previousJewelType: typeof $searchStore.jewelType = null;

  let canShare = $derived(
    !!$searchStore.jewelType &&
      !!$searchStore.conqueror &&
      ($searchStore.selectedStats.length > 0 || $searchStore.seed !== null),
  );

  $effect(() => {
    const current = $searchStore.jewelType;
    if (current !== previousJewelType) {
      // Only reset if changing jewelType AND conqueror doesn't match the new type
      // This allows history/URL loading to work (they set all fields correctly)
      // while resetting on user interaction
      if (previousJewelType !== null) {
        const currentConqueror = $searchStore.conqueror;
        const validConquerors = current ? conquerors[current.name] || [] : [];
        const isValidConqueror = validConquerors.some(
          (c: Conqueror) => c.label === currentConqueror?.label,
        );
        if (!isValidConqueror) {
          resetDependentFields();
        }
      }
      clearHighlights();
      previousJewelType = current;
    }
  });

  function checkSocketAndSearch(action: () => void) {
    if (!$treeStore.chosenSocket) {
      socketWarningMessage =
        "No jewel socket selected. Please select a socket on the passive tree before searching.";
      return;
    }
    action();
  }

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

  function buildTradeUrl(query: object): string {
    const platform =
      $searchStore.platform === "PC"
        ? ""
        : $searchStore.platform.toLowerCase() + "/";
    const league = encodeURIComponent($searchStore.league);
    return `https://www.pathofexile.com/trade/search/${platform}${league}?q=${encodeURIComponent(JSON.stringify(query))}`;
  }

  function logNextPage() {
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
    const url = buildTradeUrl(query);
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
    const url = buildTradeUrl(query);
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
    const query = buildTradeQuery(
      groupSeeds,
      $searchStore.jewelType!,
      $searchStore.conqueror,
      0,
    );
    console.log(query);
    const url = buildTradeUrl(query);
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
      const query = buildTradeQuery(
        groupSeeds,
        $searchStore.jewelType!,
        $searchStore.conqueror,
        nextPage,
      );
      console.log(query);
      const url = buildTradeUrl(query);
      console.log(url);
      window.open(url, "_blank");
      storeTradeInfo(pageSeeds, nextPage, total);
    }
  }

  async function handleSearch() {
    await performSearch(
      $searchStore.mode,
      seedInput,
      translation,
      $searchStore.jewelType,
      $searchStore.selectedStats,
    );
    if ($searchStore.searched) {
      searchStore.update((s) => {
        if (s.mode === "stats") {
          s.statsSearched = true;
          // Save successful stats search to history
          historyActions.saveCurrentSearch();
        } else if (s.mode === "seed") {
          s.seedSearched = true;
        }
        return s;
      });
    }
  }

  function backToForm() {
    seedInput = null;
    clearHighlights();
    expandedGroups = {};
    searchStore.update((s) => {
      s.searched = false;
      s.statsResults = {};
      s.currentPage = 0;
      s.totalResults = 0;
      s.orderedSeeds = [];
      s.statsSearched = false;
      s.seedSearched = false;
      return s;
    });
  }

  function setMode(newMode: "seed" | "stats" | null) {
    clearHighlights();
    searchStore.update((s) => ({
      ...s,
      mode: newMode,
      searched: newMode === "stats" ? false : s.searched,
      statsResults: newMode === "stats" ? {} : s.statsResults,
      statsSearched: false,
      seedSearched: newMode === "seed" ? false : s.seedSearched,
    }));
    seedInput = null;
    if (newMode === "stats") {
    }
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
      checkSocketAndSearch(handleSearch);
    }
  }

  function expandGroup(total: number) {
    expandedGroups = { ...expandedGroups, [total]: !expandedGroups[total] };
  }

  async function handleShare() {
    const shareUrl = generateShareUrl(
      $searchStore,
      $treeStore,
      treeData as unknown as TreeData,
    );
    const success = await copyToClipboard(shareUrl);
    if (success) {
      showShareNotification = true;
    }
  }

  function dismissShareNotification() {
    showShareNotification = false;
  }

  function findNearbyKeystone(socket: any): string {
    const treeNodes = (treeData as unknown as TreeData).nodes;
    const socketNodes = (treeData as unknown as TreeData).socketNodes[
      socket.skill.toString()
    ];

    if (!socketNodes) {
      return socket.name;
    }

    for (const nodeId of socketNodes) {
      const node = treeNodes[nodeId];
      if (node && node.isKeystone) {
        return node.name;
      }
    }

    for (const nodeId of socketNodes) {
      const node = treeNodes[nodeId];
      if (node && node.isNotable) {
        return node.name;
      }
    }

    for (const nodeId of socketNodes) {
      const node = treeNodes[nodeId];
      if (
        node &&
        node.name &&
        node.name !== "Basic Jewel Socket" &&
        !node.name.includes("Jewel Socket")
      ) {
        return node.name;
      }
    }

    return socket.name;
  }

  function generateFavoriteSuggestion(): string {
    const conquerorLabel = $searchStore.conqueror?.label || "Any";
    const jewelTypeLabel = $searchStore.jewelType?.label || "";
    const keystone = findNearbyKeystone($treeStore.chosenSocket!);
    return `${conquerorLabel} (${jewelTypeLabel}) - ${keystone}`;
  }

  function handleSaveFavorite(name: string) {
    const finalName = name.trim() === "" ? favoriteSuggestion : name;
    favoritesActions.saveFavorite(finalName);
    showSaveFavoriteModal = false;
    favoriteNotificationName = finalName;
    showFavoriteNotification = true;
  }

  function dismissFavoriteNotification() {
    showFavoriteNotification = false;
  }
</script>

<SidebarToggle bind:isOpen />

{#if isOpen}
  <aside
    class="fixed left-0 top-0 h-screen w-[650px] bg-slate-900/80 backdrop-blur-sm p-6 overflow-y-auto shadow-2xl z-40 transition-all duration-300 ease-out border-r border-slate-700 custom-scrollbar"
  >
    <header class="pl-12 pr-6 relative flex">
      <button
        class="flex-1 py-2 transition-colors cursor-pointer {activeTab ===
        'search'
          ? 'text-white border-b-2 border-blue-400'
          : 'text-slate-300 hover:text-slate-100'}"
        onclick={() => (activeTab = "search")}
      >
        Search
      </button>
      <button
        class="flex-1 py-2 transition-colors cursor-pointer {activeTab ===
        'favorites'
          ? 'text-white border-b-2 border-green-400'
          : 'text-slate-300 hover:text-slate-100'}"
        onclick={() => (activeTab = "favorites")}
      >
        Favorites
      </button>
      <button
        class="flex-1 py-2 transition-colors cursor-pointer {activeTab ===
        'history'
          ? 'text-white border-b-2 border-purple-400'
          : 'text-slate-300 hover:text-slate-100'}"
        onclick={() => (activeTab = "history")}
      >
        History
      </button>
    </header>

    <div class="pt-4">
      {#if activeTab === "search"}
        {#if $searchStore.statsSearched}
          <div class="flex items-center justify-between gap-3 mb-4">
            <div class="flex gap-2">
              <button
                onclick={backToForm}
                class="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200"
                aria-label="Back to Search"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onclick={handleShare}
                disabled={!canShare}
                class="p-2 rounded-lg transition-all duration-200 {canShare
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'}"
                aria-label="Share Configuration"
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>

              {#if $searchStore.searched && $searchStore.mode === "stats" && $searchStore.statsSearched && Object.keys($searchStore.statsResults).length > 0}
                <button
                  onclick={() => {
                    favoriteSuggestion = generateFavoriteSuggestion();
                    showSaveFavoriteModal = true;
                  }}
                  class="p-2 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-all duration-200 shadow-green-500/20"
                  aria-label="Save to Favorites"
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              {/if}
            </div>

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
          </div>

          {#if Object.keys($searchStore.statsResults).length > 0}
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
          {:else}
            <div class="bg-slate-800 rounded-lg p-8 text-center">
              <p class="text-slate-400 italic">No results to display.</p>
            </div>
          {/if}
        {:else}
          <div class="mb-4">
            <span
              class="text-sm font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
              >Jewel Type</span
            >
          </div>
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
                    mode={$searchStore.mode}
                    disabled={!$searchStore.jewelType}
                    onselectmode={setMode}
                  />
                </section>

                {#if $searchStore.mode === "seed"}
                  <SeedSearch
                    jewelType={$searchStore.jewelType}
                    bind:seed={seedInput}
                    onapplyseed={handleSeedInput}
                  />
                {/if}

                {#if $searchStore.mode === "stats"}
                  <StatsSearch jewelType={$searchStore.jewelType} />
                  <button
                    onclick={() => checkSocketAndSearch(handleSearch)}
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
      {:else if activeTab === "favorites"}
        <Favorites onswitchtotab={(tab) => (activeTab = tab)} />
      {:else if activeTab === "history"}
        <SearchHistory onswitchtotab={(tab) => (activeTab = tab)} />
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
        Maximum {MAX_FILTERS} filters per query. Seeds are grouped into ranges when
        possible (e.g., 10020-10022) to maximize filter usage, allowing to have a
        bit more than {MAX_FILTERS} seeds in search. Results are ordered by weight
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

{#if $searchStore.lastTradeInfo}
  <TradeNotification
    seeds={$searchStore.lastTradeInfo.seeds}
    conquerorLabel={$searchStore.lastTradeInfo.conquerorLabel}
    page={$searchStore.lastTradeInfo.page}
    groupName={$searchStore.lastTradeInfo.groupName}
    onDismiss={() => searchStore.update((s) => ({ ...s, lastTradeInfo: null }))}
  />
{/if}
{#if socketWarningMessage}
  <Modal
    message={socketWarningMessage}
    onCancel={() => (socketWarningMessage = "")}
  />
{/if}

{#if showSaveFavoriteModal}
  <SaveFavoriteModal
    suggestedName={favoriteSuggestion}
    onSave={handleSaveFavorite}
    onCancel={() => (showSaveFavoriteModal = false)}
  />
{/if}

{#if showFavoriteNotification}
  <FavoriteNotification
    name={favoriteNotificationName}
    onDismiss={dismissFavoriteNotification}
  />
{/if}

{#if showShareNotification}
  <ShareNotification onDismiss={dismissShareNotification} />
{/if}
