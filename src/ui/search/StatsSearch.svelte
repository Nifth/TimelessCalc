<script lang="ts">
  import type { JewelType, Stat, Translation } from "$lib/types";
  import { searchStore } from "$lib/stores/searchStore";
  import { filterStats } from "$lib/utils/sidebar/sidebarUtils";
  import { getStatsOptions } from "$lib/utils/sidebar/options";
  import jewelStatsJson from "$lib/data/jewelstats.json" with { type: "json" };
  import translationsJson from "$lib/data/translation.json" with { type: "json" };

  let { jewelType }: { jewelType: JewelType | null } = $props();

  const jewelStats: Record<string, number[]> = JSON.parse(
    JSON.stringify(jewelStatsJson),
  );

  const translation: Record<string, Translation[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

  let searchValue = $state("");
  let showDropdown = $state(false);
  let inputElement: HTMLInputElement;

  let filteredStats = $derived.by(() => {
    const computedOptions = getStatsOptions(jewelType, jewelStats, translation);
    return filterStats(
      searchValue,
      computedOptions,
      $searchStore.selectedStats,
    );
  });

  function removeStat(index: number) {
    searchStore.update((state) => {
      state.selectedStats = state.selectedStats.filter((_, i) => i !== index);
      return state;
    });
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

  function updateFilteredStats() {
    showDropdown = true;
  }

  function handleBlur() {
    setTimeout(() => {
      showDropdown = false;
    }, 150);
  }
</script>

<div class="space-y-4">
  <div class="relative">
    <input
      bind:this={inputElement}
      type="text"
      bind:value={searchValue}
      placeholder="Search for a stat..."
      oninput={updateFilteredStats}
      onfocus={() => {
        updateFilteredStats();
      }}
      onclick={() => {
        if (!searchValue.trim()) {
          updateFilteredStats();
        }
      }}
      onblur={handleBlur}
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
              onmousedown={(e) => {
                e.preventDefault();
                selectStat(stat);
              }}
            >
              {stat.label}
            </button>
          {/each}
        {:else if searchValue}
          <div class="px-4 py-3 text-slate-400 italic">No stats found</div>
        {:else}
          <div class="px-4 py-3 text-slate-400 italic">Type to search...</div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="space-y-2">
    {#if $searchStore.selectedStats.length > 0}
      <div class="flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-slate-300 text-xs">
        <span class="flex-1">Stat</span>
        <span class="w-16 text-center">Weight</span>
        <span class="w-16 text-center">Min</span>
        <span class="w-8"></span>
      </div>
    {/if}
    {#each $searchStore.selectedStats as stat, i (i)}
      <div class="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
        <span class="flex-1 text-sm text-slate-200 truncate">{stat.label}</span>
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
          onclick={() => removeStat(i)}
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
        Min total weight
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
