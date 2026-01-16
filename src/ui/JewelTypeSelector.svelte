<script lang="ts">
  import { jewelTypes } from "$lib/constants/timeless";
  import type { JewelType } from "$lib/types";

  interface Props {
    jewelType: JewelType | null;
  }

  let { jewelType = $bindable(null) }: Props = $props();
</script>

<div class="grid grid-cols-5 gap-3 items-stretch">
  {#each jewelTypes as jewel (jewel.name)}
    <label class="relative cursor-pointer h-full">
      <input
        type="radio"
        bind:group={jewelType}
        value={jewel}
        class="sr-only"
      />
      <div
        class="flex items-center justify-center px-4 py-3 rounded-lg border-2 text-center transition-all duration-200 h-full {jewelType ===
        jewel
          ? 'border-blue-400 bg-slate-700/50 text-white shadow-lg shadow-blue-500/10'
          : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700'}"
      >
        <span class="font-medium">{jewel.label}</span>
      </div>
    </label>
  {/each}
</div>
