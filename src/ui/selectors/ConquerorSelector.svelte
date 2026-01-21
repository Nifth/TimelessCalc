<script lang="ts">
  import type { Conqueror } from "$lib/types";
  import RadioButton from "$lib/ui/common/RadioButton.svelte";

  interface Props {
    conqueror: Conqueror | null;
    options: Conqueror[];
  }

  let { conqueror = $bindable(null), options }: Props = $props();
</script>

<h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
  Conqueror
</h2>
<div class="grid grid-cols-4 gap-2">
  {#each options as conquerorOption (conquerorOption.label)}
    <label class="relative cursor-pointer">
      <input
        type="radio"
        bind:group={conqueror}
        value={conquerorOption}
        class="sr-only"
      />
      <RadioButton
        _value={conquerorOption}
        label={conquerorOption.label}
        isSelected={conqueror === conquerorOption}
        size="sm"
        onclick={() => {
          conqueror = conquerorOption;
        }}
      />
    </label>
  {/each}
</div>
