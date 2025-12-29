<script lang="ts">
  import { jewelTypes } from "$lib/constants/timeless";
  import type { Conqueror, JewelType, Stat, Translation } from "$lib/types";
  import { searchStore } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import jewelStatsJson from "$lib/data/jewelstats.json" with { type: "json" };
  import translationsJson from "$lib/data/translation.json" with { type: "json" };
  import {
    getConquerorOptions,
    getStatsOptions,
  } from "$lib/utils/sidebar/options";
  import { filterStats } from "$lib/utils/sidebar/sidebarUtils";
  import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
  import { applySeed } from "$lib/utils/sidebar/searchLogic";
  import { canvas } from "$lib/konva/canvasContext";
  import {
    changeKeystone,
    changeRadius,
    resetHighlights,
  } from "$lib/konva/utils/jewelHighlight";
  import Konva from "konva";

  const jewelStats: Record<string, number[]> = JSON.parse(
    JSON.stringify(jewelStatsJson),
  );
  const translation: Record<string, Translation[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

  // === État local ===
  let isOpen = true; // Sidebar ouverte par défaut
  let mode: "seed" | "stats" | null = null;

  let seedInput: number | null = null;
  let searchValue = "";

  let showDropdown = false;
  let filteredStats: Stat[] = [];
  let inputElement: HTMLInputElement;

  let expandedGroups: Record<number, boolean> = {};

  // === Options ligne 2 (4 cards) — dépend de ligne 1 ===
  $: conquerorOptions = getConquerorOptions($searchStore.jewelType);

  $: statOptions = getStatsOptions(
    $searchStore.jewelType,
    jewelStats,
    translation,
  );

  $: timelessStats =
    $treeStore.chosenSocket && $searchStore.searched ? getTimelessStats() : {};

  // === Supprimer une stat ===
  function removeStat(index: number) {
    searchStore.update((state) => {
      state.selectedStats = state.selectedStats.filter((_, i) => i !== index);
      return state;
    });
  }

  // === Récupérer les timelessStats du socket choisi ===
  function getTimelessStats(): Record<string, number> {
    const chosenSocket = $treeStore.chosenSocket;
    if (!chosenSocket) return {};

    const statsCount: Record<string, number> = {};

    for (const node of $treeStore.allocated.values()) {
      if (node?.timelessStats) {
        for (const stat of node.timelessStats) {
          if (node.stats?.includes(stat)) continue;
          statsCount[stat] = (statsCount[stat] || 0) + 1;
        }
      }
    }

    return statsCount;
  }

  // === Highlight les nodes avec une stat spécifique ===
  function highlightNodesWithStat(stat: string) {
    canvas.highlightLayer?.destroyChildren();

    // Create circles for nodes that have this stat
    for (const node of $treeStore.allocated.values()) {
      if (node?.timelessStats?.includes(stat)) {
        const circle = new Konva.Circle({
          x: node.x,
          y: node.y,
          radius: node.isNotable ? 70 : 50,
          stroke: "yellow",
          strokeWidth: 10,
        });
        canvas.highlightLayer?.add(circle);
      }
    }

    canvas.highlightLayer?.batchDraw();
  }

  // === Highlight les nodes avec les stats recherchées ===
  function highlightSearchedStats() {
    canvas.highlightLayer?.destroyChildren();

    const searchedLabels = $searchStore.selectedStats.map(s => s.label);

    // Create circles for nodes that have any searched stat
    for (const node of $treeStore.allocated.values()) {
      if (node?.timelessStats?.some(stat => searchedLabels.includes(stat))) {
        const circle = new Konva.Circle({
          x: node.x,
          y: node.y,
          radius: node.isNotable ? 70 : 50,
          stroke: "yellow",
          strokeWidth: 10,
        });
        canvas.highlightLayer?.add(circle);
      }
    }

    canvas.highlightLayer?.batchDraw();
  }

  // Filtre les stats en temps réel
  function updateFilteredStats() {
    filteredStats = filterStats(
      searchValue,
      statOptions,
      $searchStore.selectedStats,
    );
    showDropdown = true;
  }

  // Sélectionne une stat
  function selectStat(stat: Stat) {
    if (!$searchStore.selectedStats.some((s) => s.label === stat.label)) {
      searchStore.update((state) => {
        state.selectedStats.push({
          label: stat.label,
          statKey: stat.statKey,
          weight: 1,
          minWeight: 0,
        });
        return state;
      });
    }
    searchValue = "";
    showDropdown = false;
  }

  // Ferme le dropdown si clic dehors (avec délai pour mousedown)
  function handleBlur() {
    setTimeout(() => {
      showDropdown = false;
    }, 150);
  }

  // === Soumission finale ===
  async function handleSearch() {
    await performSearch(
      mode,
      seedInput,
      translation,
      $searchStore.jewelType,
      $searchStore.selectedStats,
    );
  }

  // === Appliquer une seed depuis les résultats de stats ===
  async function applySeedFromResults(seed: number) {
    await applySeed(seed, $searchStore.jewelType!, $searchStore.conqueror!, translation);
    searchStore.update(s => { s.searched = true; s.seed = seed; return s; });
    highlightSearchedStats();
  }

  // Réactivité : synchroniser seedInput avec mode
  let searchTimeout: number | null = null;
  $: if (mode === "seed") {
    if (seedInput !== $searchStore.seed) {
      searchStore.update((state) => {
        state.seed = seedInput;
        return state;
      });
    }
    // Lancer la recherche automatiquement si seed valide, avec debounce
    if (
      seedInput &&
      seedInput >= ($searchStore.jewelType?.min || 0) &&
      seedInput <= ($searchStore.jewelType?.max || 0)
    ) {
      if (searchTimeout) window.clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(() => {
        handleSearch();
      }, 250);
    }
  }

  $: {
    // Si la valeur actuelle de line2 n'existe plus dans les nouvelles options
    if (
      !conquerorOptions.some(
        (conqueror) => conqueror === $searchStore.conqueror,
      )
    ) {
      searchStore.update((state) => {
        state.searched = false;
        state.conqueror = null;
        state.selectedStats = [];
        state.seed = null;
        state.statsResults = {};
        state.minTotalWeight = 0;
        return state;
      });
      // Optionnel : reset mode + stats
      mode = null;
    }
  }
  let previousJewelType: JewelType | null = null;
  let previousConqueror: Conqueror | null = null;

  $: currentJewelType = $searchStore.jewelType;
  $: if (currentJewelType !== previousJewelType) {
    resetHighlights();
    changeRadius($treeStore.chosenSocket);
    previousJewelType = currentJewelType;
  }
  $: currentConqueror = $searchStore.conqueror;
  $: if (currentConqueror !== previousConqueror) {
    changeKeystone($treeStore.chosenSocket);
    previousConqueror = currentConqueror;
  }
</script>

<!-- Burger Button -->
<button
  on:click={() => (isOpen = !isOpen)}
  class="burger"
  aria-label="Toggle menu"
>
  <span></span><span></span><span></span>
</button>

<!-- Sidebar -->
{#if isOpen}
  <aside class="sidebar">
    <!-- Ligne 1 : 5 cards radio -->
    <section class="line line1">
      {#each jewelTypes as jewelType (jewelType.name)}
        <label
          class="card"
          class:selected={$searchStore.jewelType === jewelType}
        >
          <input
            type="radio"
            bind:group={$searchStore.jewelType}
            value={jewelType}
          />
          <div class="card-label">{jewelType.label}</div>
        </label>
      {/each}
    </section>

    {#if $searchStore.jewelType}
      <!-- Ligne 2 : 4 cards radio (dépend de ligne 1) -->
      <section class="line line2">
        {#each conquerorOptions as conqueror (conqueror.label)}
          <label
            class="card"
            class:selected={$searchStore.conqueror === conqueror}
          >
            <input
              type="radio"
              bind:group={$searchStore.conqueror}
              value={conqueror}
            />
            <div class="card-label">{conqueror.label}</div>
          </label>
        {/each}
      </section>
      {#if $searchStore.conqueror}
        <!-- Ligne 3 : Choix du mode -->
        <section class="line line3">
          <button
            on:click={() => (mode = "seed")}
            class:active={mode === "seed"}
          >
            Enter seed
          </button>
          <button
            on:click={() => (mode = "stats")}
            class:active={mode === "stats"}
          >
            Select stats
          </button>
        </section>

        <!-- Mode Seed -->
        {#if mode === "seed"}
          <div class="mode-content seed">
            <input
              type="number"
              bind:value={seedInput}
              placeholder="Entrez la seed"
              min="0"
              step="1"
            />
            <p>
              From {$searchStore.jewelType.min} to {$searchStore.jewelType.max}
            </p>
          </div>
        {/if}

        <!-- Mode Stats -->
        {#if mode === "stats"}
          <div class="mode-content stats">
            <!-- Input + Dropdown custom -->
            <div class="autocomplete-wrapper">
              <input
                bind:this={inputElement}
                type="text"
                bind:value={searchValue}
                placeholder="Rechercher une stat..."
                on:input={updateFilteredStats}
                on:focus={() => {
                  showDropdown = true;
                  updateFilteredStats();
                }}
                on:blur={handleBlur}
              />

              {#if showDropdown}
                <div class="dropdown">
                  {#if filteredStats.length > 0}
                    {#each filteredStats as stat (stat.statKey)}
                      <!-- svelte-ignore a11y_no_static_element_interactions -->
                      <div
                        class="dropdown-item"
                        on:mousedown|preventDefault={() => selectStat(stat)}
                      >
                        {stat.label}
                      </div>
                    {/each}
                  {:else if searchValue}
                    <div class="dropdown-item">Aucune stat trouvée</div>
                  {:else}
                    <div class="dropdown-item">Tapez pour rechercher...</div>
                  {/if}
                </div>
              {/if}
            </div>

            <!-- Liste des stats ajoutées -->
            <div class="stats-list">
              {#each $searchStore.selectedStats as stat, i (i)}
                <div class="stat-row">
                  <span class="stat-name">{stat.label}</span>
                  <input
                    type="number"
                    bind:value={stat.weight}
                    placeholder="Poids"
                    min="0"
                    step="0.1"
                  />
                  <input
                    type="number"
                    bind:value={stat.minWeight}
                    placeholder="Min"
                    min="0"
                    step="0.1"
                  />
                  <button on:click={() => removeStat(i)} class="delete"
                    >Supprimer</button
                  >
                </div>
              {/each}
              {#if $searchStore.selectedStats.length === 0}
                <p class="empty">Aucune stat sélectionnée</p>
              {/if}
            </div>

            <!-- Min total weight -->
            {#if $searchStore.selectedStats.length > 0}
              <div class="min-weight-wrapper">
                <label for="minTotalWeight">Poids total minimum (0 = auto):</label>
                <input
                  id="minTotalWeight"
                  type="number"
                  bind:value={$searchStore.minTotalWeight}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            {/if}

            <!-- Résultats de recherche par stats -->
            {#if $searchStore.searched && Object.keys($searchStore.statsResults).length > 0}
              <div class="stats-results">
                {#each Object.keys($searchStore.statsResults).sort((a, b) => parseFloat(b) - parseFloat(a)) as total (total)}
                  <div class="match-group">
                    <h4
                      class="match-header"
                      class:expanded={expandedGroups[parseFloat(total)]}
                      on:click={() => {
                        const t = parseFloat(total);
                        expandedGroups[t] = !expandedGroups[t];
                        expandedGroups = {...expandedGroups};
                      }}
                    >
                      Poids {total} ({$searchStore.statsResults[total].length} results)
                    </h4>
                    {#if expandedGroups[parseFloat(total)]}
                      {#each $searchStore.statsResults[total] as item (item.seed)}
                        <div class="result-item" on:click={() => applySeedFromResults(item.seed)}>
                          <span class="jewel-id">Seed: {item.seed}</span>
                          <div class="stat-counts">
                            {#each Object.entries(item.statCounts) as [statKey, count] (statKey)}
                              {@const stat = $searchStore.selectedStats.find(s => s.statKey === parseInt(statKey))}
                              {#if stat}
                                <span>({count}) {stat.label}</span>
                              {/if}
                            {/each}
                          </div>
                          <div class="total-weight">Poids total: {item.totalWeight.toFixed(1)}</div>
                        </div>
                      {/each}
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    {/if}

    <!-- Liste des timelessStats -->
    {#if $searchStore.searched && Object.keys(timelessStats).length > 0}
      <div class="timeless-stats">
        {#each Object.entries(timelessStats) as [stat, count] (stat)}
          <div
            class="timeless-stat"
            on:click={() => highlightNodesWithStat(stat)}
          >
            ({count}) {stat}
          </div>
        {/each}
      </div>
    {/if}

    <!-- Bouton de recherche -->
    {#if mode !== "seed"}
      <button class="search-btn" on:click={handleSearch}>Search</button>
    {/if}
  </aside>
{/if}

<style>
  :global(body) {
    font-family: system-ui, sans-serif;
  }

  .burger {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1000;
    background: #333;
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }
  .burger span {
    width: 20px;
    height: 2px;
    background: white;
    border-radius: 1px;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 700px;
    background: #1a1a1ad3;
    padding: 5rem 1.5rem 1.5rem;
    overflow-y: auto;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 999;
  }

  .line {
    margin-bottom: 1.5rem;
  }

  .line1,
  .line2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .card {
    position: relative;
    border: 2px solid #1f1f1f;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    background: rgb(48, 48, 48);
    color: white;
  }
  .card input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }
  .card-label {
    padding: 0.75rem 0.5rem;
    text-align: center;
    font-size: 0.9rem;
    font-weight: 500;
  }
  .card.selected {
    border-color: #e7f3ff;
  }

  .line3 {
    display: flex;
    gap: 0.75rem;
  }
  .line3 button {
    flex: 1;
    padding: 0.75rem;
    background: #1b1b1b;
    color: white;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .line3 button.active {
    background: #3b3b3b;
  }

  .mode-content {
    margin: 1.5rem 0;
    padding: 1rem;
  }

  .seed input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
  }

  .timeless-stats {
    margin-top: 1rem;
    padding: 0.5rem;
    background: #2a2a2a;
    border-radius: 6px;
  }

  .timeless-stat {
    color: #e7f3ff;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
    cursor: pointer;
  }

  .timeless-stat:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .timeless-stat:last-child {
    margin-bottom: 0;
  }

  .stats-list {
    margin-top: 1rem;
  }
  .stat-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #f1f3f5;
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }
  .stat-name {
    flex: 1;
    font-weight: 500;
  }
  .stat-row input {
    width: 60px;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  .delete {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .min-weight-wrapper {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .min-weight-wrapper label {
    color: white;
    font-weight: 500;
  }
  .min-weight-wrapper input {
    width: 80px;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }

  .empty {
    color: #6c757d;
    font-style: italic;
    text-align: center;
    margin: 1rem 0;
  }

  .search-btn {
    width: 100%;
    padding: 1rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1.5rem;
    transition: background 0.2s;
  }
  .search-btn:hover {
    background: #218838;
  }

  .autocomplete-wrapper {
    position: relative;
    width: 100%;
  }

  .autocomplete-wrapper input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ced4da;
    border-top: none;
    border-radius: 0 0 6px 6px;
    z-index: 10;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .dropdown-item {
    padding: 0.75rem;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }

  p {
    color: white;
  }

  .dropdown-item:hover {
    background: #007bff;
    color: white;
  }

  .stats-results {
    margin-top: 1rem;
    padding: 0.5rem;
    background: #2a2a2a;
    border-radius: 6px;
    max-height: 300px;
    overflow-y: auto;
  }

  .stats-results h3 {
    color: white;
    margin-bottom: 0.5rem;
  }

  .match-group {
    margin-bottom: 1rem;
  }

  .match-header {
    color: white;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0.5rem;
    background: #4a4a4a;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .match-header:hover {
    background: #5a5a5a;
  }

  .match-header.expanded::before {
    content: "▼ ";
  }

  .match-header:not(.expanded)::before {
    content: "▶ ";
  }

  .result-item {
    color: #e7f3ff;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: #3a3a3a;
    border-radius: 4px;
    cursor: pointer;
  }

  .result-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .jewel-id {
    font-weight: bold;
  }

  .stat-counts {
    margin-top: 0.25rem;
  }

  .stat-counts span {
    display: block;
    margin-bottom: 0.1rem;
  }

  .total-weight {
    margin-top: 0.25rem;
    font-weight: bold;
    color: #ffd700;
  }
</style>
