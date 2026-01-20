<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  export let seeds: number[];
  export let conquerorLabel: string;
  export let page: number;
  export let groupName: string | undefined = undefined;
  export let onDismiss: () => void;
</script>

<div
  class="fixed right-4 bottom-4 w-72 max-h-80 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden z-50"
  transition:fly={{ x: 320, duration: 500, easing: cubicOut }}
>
  <div
    class="flex items-center justify-between px-3 py-2 bg-slate-700 border-b border-slate-600"
  >
    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold text-white">Trade Seeds</span>
      {#if groupName}
        <span class="text-xs text-blue-400">({groupName})</span>
      {/if}
    </div>
    <button
      on:click={onDismiss}
      class="text-slate-400 hover:text-white p-1 transition-colors duration-200"
      aria-label="Dismiss"
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
  <div class="px-3 py-1 bg-slate-800/50 border-b border-slate-700">
    <span class="text-xs text-slate-400"
      >{conquerorLabel} • Page {page + 1}</span
    >
  </div>
  <div class="max-h-48 overflow-y-auto custom-scrollbar">
    {#each seeds as seed (seed)}
      <div
        class="px-3 py-1.5 text-sm text-slate-300 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/50 transition-colors duration-200"
      >
        {seed}
      </div>
    {/each}
  </div>
</div>
