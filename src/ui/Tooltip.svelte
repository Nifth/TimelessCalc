<script lang="ts">
  import type { Node } from "$lib/types";

  export let node: Node | null = null;
  export let x: number = 0;
  export let y: number = 0;

  $: baseStats = node?.stats || [];
  $: timelessStats = node?.timelessStats;
  $: statsToDisplay = timelessStats ? timelessStats : baseStats;
  $: header = node?.conqueredName || node?.name || "";
</script>

{#if node}
  <div
    class="fixed z-50 pointer-events-none bg-black/90 text-amber-100 p-3 rounded-lg font-fontin text-lg max-w-sm whitespace-pre-wrap shadow-lg"
    style="left: {x + 20}px; top: {y - 20}px;"
  >
    <div class="font-bold mb-2">{header}</div>
    <div class="space-y-1">
      {#each statsToDisplay as stat (stat)}
        <div class="text-sm" class:text-red-400={!baseStats.includes(stat)}>
          {stat}
        </div>
      {/each}
    </div>
  </div>
{/if}
