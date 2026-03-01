<script lang="ts">
  import type { Node } from "$lib/types";

  interface Props {
    node: Node | null;
    x: number;
    y: number;
  }

  let { node, x, y }: Props = $props();

  let baseStats = $derived(node?.stats || []);
  let timelessStats = $derived(node?.timelessStats);
  let statsToDisplay = $derived(timelessStats ? timelessStats : baseStats);
  let isExtraStat = $derived.by(() => {
    if (!timelessStats) return [];
    return timelessStats.map((stat, i) => {
      const statIndexInBase = baseStats.indexOf(stat);
      if (statIndexInBase === -1) return true;
      const occurrencesInBase = baseStats.filter((s) => s === stat).length;
      const occurrencesUpToI = timelessStats
        .slice(0, i + 1)
        .filter((s) => s === stat).length;
      return occurrencesUpToI > occurrencesInBase;
    });
  });
  let header = $derived(node?.conqueredName || node?.name || "");
</script>

{#if node}
  <div
    class="fixed z-50 pointer-events-none bg-black/90 text-amber-100 p-3 rounded-lg font-fontin text-lg max-w-sm whitespace-pre-wrap shadow-lg"
    style="left: {x + 20}px; top: {y - 20}px;"
  >
    <div class="font-bold mb-2">{header}</div>
    <div class="space-y-1">
      {#each statsToDisplay as stat, index (index)}
        <div class="text-sm" class:text-red-400={isExtraStat[index]}>
          {stat}
        </div>
      {/each}
    </div>
  </div>
{/if}
