<script lang="ts">
  import { onMount } from "svelte";
  import { fetchLeagues, getCachedLeagues } from "$lib/providers/leagues";
  import { searchStore } from "$lib/stores/searchStore";
  import type { League } from "$lib/types";
  import Dropdown from "$lib/ui/common/Dropdown.svelte";

  let leagues: League[] = [];
  let loading = $state(true);
  let dropdownOptions: { value: string; display: string }[] = $state([]);
  onMount(() => {
    const cached = getCachedLeagues();
    if (cached) {
      leagues = cached;
      loading = false;
      dropdownOptions = leagues.map((league) => ({
        value: league.name,
        display: league.name,
      }));
    } else {
      fetchLeagues().then((data) => {
        leagues = data;
        loading = false;
        dropdownOptions = leagues.map((league) => ({
          value: league.name,
          display: league.name,
        }));
      });
    }
  });

  function selectLeague(name: string) {
    searchStore.update((s) => {
      s.league = name;
      return s;
    });
  }
</script>

<Dropdown
  options={dropdownOptions}
  selectedValue={$searchStore.league}
  onSelect={selectLeague}
  {loading}
  loadingText="Loading leagues..."
/>
