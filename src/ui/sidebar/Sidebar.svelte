<script lang="ts">
    import SidebarToggle from "$lib/ui/common/SidebarToggle.svelte";
    import SearchTab from "$lib/ui/search/SearchTab.svelte";
    import SearchHistory from "$lib/ui/search/SearchHistory.svelte";
    import Favorites from "$lib/ui/favorites/Favorites.svelte";
    import { searchStore } from "$lib/stores/searchStore";
    import { getSeedsPerPage, getPageRangeFromOrdered, MAX_FILTERS } from "$lib/utils/sidebar/tradeQuery";

   let isOpen = $state(true);
   let activeTab = $state<"search" | "favorites" | "history">("search");
   let tooltipPosition: { top: number; left: number } | null = $state(null);
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
         <SearchTab ontargetposition={(pos) => tooltipPosition = pos} />
       {:else if activeTab === "favorites"}
         <Favorites onswitchtotab={(tab) => (activeTab = tab)} />
       {:else if activeTab === "history"}
         <SearchHistory onswitchtotab={(tab) => (activeTab = tab)} />
       {/if}
     </div>
   </aside>
 {/if}

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
