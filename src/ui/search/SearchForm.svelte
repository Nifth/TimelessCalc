<script lang="ts">
  import type { Conqueror } from "$lib/types";
  import { searchStore } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import { historyActions } from "$lib/stores/historyStore";
  import { conquerors } from "$lib/constants/timeless";
  import { getConquerorOptions } from "$lib/utils/sidebar/options";
  import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
  import translationsJson from "$lib/data/translation.json" with { type: "json" };

   import JewelTypeSelector from "$lib/ui/selectors/JewelTypeSelector.svelte";
   import ConquerorSelector from "$lib/ui/selectors/ConquerorSelector.svelte";
   import ModeSelector from "$lib/ui/selectors/ModeSelector.svelte";
   import SeedSearch from "$lib/ui/search/SeedSearch.svelte";
   import StatsSearch from "$lib/ui/search/StatsSearch.svelte";
   import NodeToggles from "$lib/ui/debug/NodeToggles.svelte";
   import Modal from "$lib/ui/common/Modal.svelte";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translation: Record<string, any[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

  let seedInput: number | null = $state(null);
  let socketWarningMessage = $state("");

  let previousJewelType: typeof $searchStore.jewelType = null;

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
          searchStore.update((s) => ({
            ...s,
            conqueror: null,
            selectedStats: [],
            minTotalWeight: 0,
            searched: false,
            statsResults: {},
            orderedSeeds: [],
            currentPage: 0,
            totalResults: 0,
            statsSearched: false,
            seedSearched: false,
          }));
        }
      }
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

  function setMode(newMode: "seed" | "stats" | null) {
    searchStore.update((s) => ({
      ...s,
      mode: newMode,
      searched: newMode === "stats" ? false : s.searched,
      statsResults: newMode === "stats" ? {} : s.statsResults,
      statsSearched: false,
      seedSearched: newMode === "seed" ? false : s.seedSearched,
    }));
    seedInput = null;
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
</script>

<div class="space-y-6">
  <section>
    <JewelTypeSelector bind:jewelType={$searchStore.jewelType} />
  </section>

  {#if $searchStore.jewelType}
    <section>
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

{#if socketWarningMessage}
  <Modal
    message={socketWarningMessage}
    onCancel={() => (socketWarningMessage = "")}
  />
{/if}