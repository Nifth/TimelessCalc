<script lang="ts">
  import { searchStore } from "$lib/stores/searchStore";
  import type { Platform } from "$lib/types";

  const platforms: Platform[] = ["PC", "Xbox", "Playstation"];
  let isOpen = false;

  function selectPlatform(platform: Platform) {
    $searchStore.platform = platform;
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

<div class="relative">
  <button
    type="button"
    on:click={() => (isOpen = !isOpen)}
    on:blur={handleBlur}
    class="w-full py-2.5 px-4 rounded-lg bg-slate-700 border border-slate-600 text-white text-left font-medium cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-slate-600 hover:border-slate-500"
  >
    <span>{$searchStore.platform}</span>
    <svg
      class="w-4 h-4 transition-transform duration-200 {isOpen
        ? 'rotate-180'
        : ''} flex-shrink-0 ml-2"
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

  {#if isOpen}
    <div
      class="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 overflow-hidden"
    >
      {#each platforms as platform (platform)}
        <button
          type="button"
          class="w-full px-4 py-2.5 text-left cursor-pointer transition-all duration-150 {$searchStore.platform ===
          platform
            ? 'bg-blue-600 text-white'
            : 'text-slate-200 hover:bg-slate-700'}"
          on:mousedown|preventDefault={() => selectPlatform(platform)}
        >
          {platform}
        </button>
      {/each}
    </div>
  {/if}
</div>
