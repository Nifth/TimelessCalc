<script lang="ts">
  import { searchStore } from "$lib/stores/searchStore";
  import SearchForm from "$lib/ui/search/SearchForm.svelte";
  import SearchResults from "$lib/ui/search/SearchResults.svelte";
</script>

{#if $searchStore.statsSearched}
  <SearchResults />
{:else}
  <SearchForm />
{/if}