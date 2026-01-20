<script lang="ts">
  import type { TreeData, Node } from "$lib/types";
   import { searchStore } from "$lib/stores/searchStore";
   import { treeStore } from "$lib/stores/treeStore";
   import { URLS } from "$lib/constants/urls";
  import { clearHighlights } from "$lib/konva/utils/jewelHighlight";
  import { applySeed } from "$lib/utils/sidebar/searchLogic";
   import {
     buildTradeQuery,
     getSeedsPerPage,
   } from "$lib/utils/sidebar/tradeQuery";
  import {
    generateShareUrl,
    copyToClipboard,
  } from "$lib/utils/sharing/shareUtils";
  import translationsJson from "$lib/data/translation.json" with { type: "json" };
  import treeData from "$lib/data/tree.json" with { type: "json" };

   import LeagueSelector from "$lib/ui/selectors/LeagueSelector.svelte";
   import PlatformSelector from "$lib/ui/selectors/PlatformSelector.svelte";
   import StatsResults from "$lib/ui/search/StatsResults.svelte";
   import TradeControls from "$lib/ui/search/TradeControls.svelte";
   import SaveFavoriteModal from "$lib/ui/modals/SaveFavoriteModal.svelte";
   import { favoritesActions } from "$lib/stores/favoritesStore";
   import { showNotification } from "$lib/stores/notificationStore";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translation: Record<string, any[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

   let { ontargetposition }: { ontargetposition?: (pos: { top: number; left: number } | null) => void } = $props();

   let expandedGroups: Record<number, boolean> = $state({});
   let groupPages: Record<string, number> = $state({});
   let hasGroupTraded: Record<string, boolean> = $state({});
   let _hasTraded = $state(false);

   let showSaveFavoriteModal = $state(false);
   let favoriteSuggestion = $state("");
   let favoriteNotificationName = $state("");

  let canShare = $derived(
    !!$searchStore.jewelType &&
      !!$searchStore.conqueror &&
      ($searchStore.selectedStats.length > 0 || $searchStore.seed !== null),
  );

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
    return `${URLS.POE_TRADE_SEARCH}${platform}${league}?q=${encodeURIComponent(JSON.stringify(query))}`;
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

  function backToForm() {
    clearHighlights();
    expandedGroups = {};
    searchStore.update((s) => ({
      ...s,
      searched: false,
      statsResults: {},
      currentPage: 0,
      totalResults: 0,
      orderedSeeds: [],
      statsSearched: false,
      seedSearched: false,
    }));
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

  function expandGroup(total: number) {
    expandedGroups = { ...expandedGroups, [total]: !expandedGroups[total] };
  }

  async function handleShare() {
    const shareUrl = generateShareUrl(
      $searchStore,
      $treeStore,
    );
      const success = await copyToClipboard(shareUrl);
      if (success) {
        showNotification('share', 'Link copied to clipboard!');
      }
   }

   function findNearbyKeystone(socket: Node): string {
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
      showNotification('favorite', `Saved as '${favoriteNotificationName}'`, 3000);
   }
</script>

<div class="flex items-center justify-between gap-3 mb-4">
  <div class="flex gap-2">
    <button
      onclick={backToForm}
      class="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer"
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
      class="p-2 cursor-pointer rounded-lg transition-all duration-200 {canShare
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

    {#if Object.keys($searchStore.statsResults).length > 0}
      <button
        onclick={() => {
          favoriteSuggestion = generateFavoriteSuggestion();
          showSaveFavoriteModal = true;
        }}
        class="p-2 cursor-pointer rounded-lg bg-green-600 hover:bg-green-500 text-white transition-all duration-200 shadow-green-500/20"
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
     hasTraded={_hasTraded}
     ontrade={handleTrade}
     onnext={() => {
       nextPage();
       logNextPage();
     }}
     {ontargetposition}
   >
    <LeagueSelector slot="league" />
    <PlatformSelector slot="platform" />
  </TradeControls>
</div>

{#if Object.keys($searchStore.statsResults).length > 0}
  <StatsResults
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




{#if showSaveFavoriteModal}
  <SaveFavoriteModal
    suggestedName={favoriteSuggestion}
    onSave={handleSaveFavorite}
    onCancel={() => (showSaveFavoriteModal = false)}
  />
{/if}

