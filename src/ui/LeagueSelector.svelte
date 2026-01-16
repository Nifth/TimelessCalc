<script lang="ts">
  import { onMount } from "svelte";
  import { fetchLeagues, getCachedLeagues } from "$lib/providers/leagues";
  import { searchStore } from "$lib/stores/searchStore";
  import type { League } from "$lib/types";

  let leagues: League[] = [];
  let loading = true;
  let isOpen = false;

  onMount(() => {
    const cached = getCachedLeagues();
    if (cached) {
      leagues = cached;
      loading = false;
    } else {
      fetchLeagues().then((data) => {
        leagues = data;
        loading = false;
      });
    }
  });

  function selectLeague(name: string) {
    $searchStore.league = name;
    isOpen = false;
  }

  function handleBlur() {
    isOpen = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      isOpen = false;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if loading}
  <div class="flex items-center justify-center py-2">
    <div class="w-4 h-4 border-2 border-slate-500 border-t-blue-400 rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="relative">
    <button
      type="button"
      on:click={() => (isOpen = !isOpen)}
      on:blur={handleBlur}
      class="w-full py-2.5 px-4 rounded-lg bg-slate-700 border border-slate-600 text-white text-left font-medium cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-slate-600 hover:border-slate-500 truncate"
    >
      <span class="truncate">{$searchStore.league}</span>
      <svg
        class="w-4 h-4 transition-transform duration-200 {isOpen ? 'rotate-180' : ''} flex-shrink-0 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {#if isOpen}
      <div class="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 overflow-hidden min-w-[12rem]">
        {#each leagues as league (league.name)}
          <button
            type="button"
            class="w-full px-4 py-2.5 text-left cursor-pointer transition-all duration-150 {$searchStore.league === league.name
              ? 'bg-blue-600 text-white'
              : 'text-slate-200 hover:bg-slate-700'}"
            on:mousedown|preventDefault={() => selectLeague(league.name)}
          >
            {league.name}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
