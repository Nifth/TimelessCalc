<script lang="ts">
  import { searchStore } from "$lib/stores/searchStore";
  import SearchForm from "$lib/ui/search/SearchForm.svelte";
  import SearchResults from "$lib/ui/search/SearchResults.svelte";

  interface Props {
    ontargetposition?: (pos: { top: number; left: number } | null) => void;
  }

  let { ontargetposition }: Props = $props();
</script>

{#if $searchStore.statsSearched}
  <SearchResults {ontargetposition} />
{:else}
  <SearchForm />
{/if}
