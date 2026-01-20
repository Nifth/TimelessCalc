<script lang="ts">
  import { searchStore } from "$lib/stores/searchStore";
  import SearchForm from "./SearchForm.svelte";
  import SearchResults from "./SearchResults.svelte";
</script>

{#if $searchStore.statsSearched}
  <SearchResults />
{:else}
  <SearchForm />
{/if}