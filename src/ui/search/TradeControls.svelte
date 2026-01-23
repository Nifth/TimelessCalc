<script lang="ts">
  import { searchStore } from "$lib/stores/searchStore";
  import { getSeedsPerPage } from "$lib/utils/sidebar/tradeQuery";
  import { get } from "svelte/store";
  import type { Snippet } from "svelte";

  interface Props {
    hasTraded?: boolean;
    ontrade: () => void;
    onnext: () => void;
    ontargetposition?: (pos: { top: number; left: number } | null) => void;
    league?: Snippet;
    platform?: Snippet;
  }

  let {
    hasTraded = false,
    ontrade,
    onnext,
    ontargetposition,
    league,
    platform,
  }: Props = $props();

  const jewelType = get(searchStore).jewelType;
  const conqueror = get(searchStore).conqueror;

  let showTooltip = $state(false);
  let tooltipButton: HTMLButtonElement | undefined = $state();

  function handleMouseEnter() {
    showTooltip = true;
    updatePosition();
  }

  function handleMouseLeave() {
    showTooltip = false;
    ontargetposition?.(null);
  }

  function updatePosition() {
    if (showTooltip && tooltipButton) {
      const rect = tooltipButton.getBoundingClientRect();
      const pos = {
        top: (rect?.top || 60) + 50,
        left: (rect?.left || 200) + 30,
      };
      ontargetposition?.(pos);
    }
  }
</script>

<div class="flex flex-wrap gap-2 items-center">
  <div class="w-36">
    {@render league?.()}
  </div>
  <div class="w-22">
    {@render platform?.()}
  </div>
  <button
    type="button"
    onclick={ontrade}
    class="h-[46px] px-3 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium cursor-pointer transition-all duration-200"
  >
    Trade
  </button>
  {#if hasTraded && $searchStore.totalResults > 0}
    {@const seedsPerPage = getSeedsPerPage(jewelType!, conqueror)}
    {@const maxPage = Math.floor(
      ($searchStore.totalResults - 1) / seedsPerPage,
    )}
    {#if $searchStore.currentPage < maxPage}
      <button
        type="button"
        onclick={onnext}
        class="h-[46px] px-3 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium cursor-pointer transition-all duration-200"
      >
        Next
      </button>
    {/if}
  {/if}
  <button
    type="button"
    bind:this={tooltipButton}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    aria-label="Show pagination info"
    class="h-[46px] px-3 rounded-lg bg-blue-900/50 hover:bg-blue-800/50 text-blue-200 text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center border border-blue-700/50"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </button>
</div>
