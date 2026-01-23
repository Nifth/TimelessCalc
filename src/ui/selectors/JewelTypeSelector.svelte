<script lang="ts">
  import { jewelTypes } from "$lib/constants/timeless";
  import type { JewelType } from "$lib/types";
  import { loadJewel, cache } from "$lib/providers/jewels";
  import { setJewelLoadError } from "$lib/stores/searchStore";
  import { searchStore } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import { get } from "svelte/store";
  import RadioButton from "$lib/ui/common/RadioButton.svelte";

  interface Props {
    jewelType: JewelType | null;
  }

  let { jewelType = $bindable(null) }: Props = $props();

  let loadingFor: string | null = null;
  let previousJewelTypeName: string | null = null;

  $effect(() => {
    if (jewelType !== null) {
      const jewelId = jewelType.name;
      const chosenSocket = get(treeStore).chosenSocket?.skill;

      if (!chosenSocket) {
        return;
      }

      const cacheKey = `${jewelId}-${chosenSocket}`;

      if (cache.has(cacheKey)) {
        return;
      }

      if (loadingFor === cacheKey) {
        return;
      }

      loadingFor = cacheKey;
      loadJewel(jewelId, String(chosenSocket))
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          if (jewelType) {
            setJewelLoadError(jewelType, message);
          }
        })
        .finally(() => {
          if (loadingFor === cacheKey) {
            loadingFor = null;
          }
        });
    }
  });

  $effect(() => {
    // Reset statSearchMode to 'occurrences' whenever jewelType changes
    if (jewelType !== null) {
      const currentJewelTypeName = jewelType.name;
      if (previousJewelTypeName !== null && currentJewelTypeName !== previousJewelTypeName) {
        searchStore.update((s) => ({ ...s, statSearchMode: "occurrences" }));
      }
      previousJewelTypeName = currentJewelTypeName;
    }
  });
</script>

<div class="mb-4">
  <span
    class="text-sm font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
    >Jewel Type</span
  >
</div>
<div class="grid grid-cols-5 gap-3 items-stretch">
  {#each jewelTypes as jewel (jewel.name)}
    <label class="relative cursor-pointer h-full">
      <input
        type="radio"
        bind:group={jewelType}
        value={jewel}
        class="sr-only"
      />
      <div class="flex items-center justify-center h-full">
        <RadioButton
          _value={jewel}
          label={jewel.label}
          isSelected={jewelType === jewel}
          size="lg"
          onclick={() => {
            jewelType = jewel;
          }}
        />
      </div>
    </label>
  {/each}
</div>
