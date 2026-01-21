<script lang="ts">
  import { searchStore } from "$lib/stores/searchStore";
  import type { Platform } from "$lib/types";
  import Dropdown from "$lib/ui/common/Dropdown.svelte";

  const platforms: Platform[] = ["PC", "Xbox", "Playstation"];

  let dropdownOptions = $derived.by(() => {
    return platforms.map((platform) => ({
      value: platform,
      display: platform,
    }));
  });

  function selectPlatform(platform: string) {
    $searchStore.platform = platform as Platform;
  }
</script>

<Dropdown
  options={dropdownOptions}
  selectedValue={$searchStore.platform}
  onSelect={selectPlatform}
/>
