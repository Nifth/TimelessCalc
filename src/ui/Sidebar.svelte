<script lang="ts">
   import SidebarToggle from "$lib/ui/common/SidebarToggle.svelte";
   import SearchTab from "$lib/ui/search/SearchTab.svelte";
   import SearchHistory from "$lib/ui/search/SearchHistory.svelte";
   import Favorites from "$lib/ui/Favorites.svelte";

  let isOpen = $state(true);
  let activeTab = $state<"search" | "favorites" | "history">("search");
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
        <SearchTab />
      {:else if activeTab === "favorites"}
        <Favorites onswitchtotab={(tab) => (activeTab = tab)} />
      {:else if activeTab === "history"}
        <SearchHistory onswitchtotab={(tab) => (activeTab = tab)} />
      {/if}
    </div>
  </aside>
{/if}
