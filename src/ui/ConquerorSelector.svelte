<script lang="ts">
  import type { Conqueror } from "$lib/types";

  interface Props {
    conqueror: Conqueror | null;
    options: Conqueror[];
  }

  let { conqueror = $bindable(null), options }: Props = $props();
</script>

<div class="grid grid-cols-4 gap-2">
  {#each options as conquerorOption (conquerorOption.label)}
    <label class="relative cursor-pointer">
      <input
        type="radio"
        bind:group={conqueror}
        value={conquerorOption}
        class="sr-only"
      />
      <div
        class="px-2 py-2 rounded-lg border-2 text-center text-sm transition-all duration-200 {conqueror ===
        conquerorOption
          ? 'border-blue-400 bg-slate-700/50 text-white shadow-lg shadow-blue-500/10'
          : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700'}"
      >
        <span class="font-medium">{conquerorOption.label}</span>
      </div>
    </label>
  {/each}
</div>
