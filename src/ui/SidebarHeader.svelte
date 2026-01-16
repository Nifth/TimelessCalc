<script lang="ts">
  let {
    showingResults,
    mode,
  }: {
    showingResults: boolean;
    mode: "seed" | "stats" | null;
  } = $props();
</script>

<header
  class="flex items-center gap-3 pl-12 pb-4 border-b border-slate-700 relative"
>
  {#if showingResults && mode === "stats"}
    <slot name="trade" />
  {:else if !showingResults}
    <span
      class="text-sm font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
      >Jewel Type</span
    >
  {/if}
</header>
