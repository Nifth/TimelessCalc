<script lang="ts">
  import { jewelTypes } from "$lib/constants/timeless";
  import type { JewelType } from "$lib/types";
  import { loadJewel, cache } from "$lib/providers/jewels";
  import { setJewelLoadError } from "$lib/stores/searchStore";

  interface Props {
    jewelType: JewelType | null;
  }

  let { jewelType = $bindable(null) }: Props = $props();

  let loadingFor: string | null = null;

  $effect(() => {
    if (jewelType !== null) {
      const jewelId = jewelType.name;

      // Skip if already loaded (check cache directly)
      if (cache.has(jewelId)) {
        return;
      }

      // Skip if already loading this jewel
      if (loadingFor === jewelId) {
        return;
      }

      loadingFor = jewelId;
      loadJewel(jewelId)
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          setJewelLoadError(jewelType, message);
        })
        .finally(() => {
          if (loadingFor === jewelId) {
            loadingFor = null;
          }
        });
    }
  });
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
