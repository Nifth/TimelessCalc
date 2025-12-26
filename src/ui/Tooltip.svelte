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
  <div class="tooltip" style="left: {x + 20}px; top: {y - 20}px;">
    <div class="header">{header}</div>
    <div class="stats">
      {#each statsToDisplay as stat (stat)}
        <div class="stat" class:red={!baseStats.includes(stat)}>{stat}</div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.92);
    color: #e8e1d2;
    padding: 12px 18px;
    border-radius: 8px;
    font:
      20px Fontin,
      sans-serif;
    pointer-events: none;
    z-index: 9999;
    max-width: 400px;
    white-space: pre-wrap;
  }

  .header {
    font-weight: bold;
    margin-bottom: 8px;
  }

  .stat {
    margin-bottom: 4px;
  }

  .stat.red {
    color: #ff6b6b;
  }
</style>
