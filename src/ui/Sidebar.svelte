<script lang="ts">
  import { writable, type Writable } from 'svelte/store';
  import { conquerors, jewelTypes } from '$lib/constants/timeless';

  // === Types ===
  interface Line1Option {
    value: string;
    label: string;
  }

  interface Line2Option {
    value: string;
    label: string;
  }

  interface StatItem {
    name: string;
    weight: number;
    minWeight: number;
  }

  // === Stores (exportés pour usage externe) ===
  export const selectedLine1: Writable<number> = writable();
  export const selectedLine2: Writable<string> = writable('');
  export const selectedSeed: Writable<string> = writable('');
  export const selectedStats: Writable<StatItem[]> = writable([]);

  // === État local ===
  let isOpen = true; // Sidebar ouverte par défaut
  let mode: 'seed' | 'stats' | null = null;

  let seedInput = '';
  let searchValue = '';
  let statsArray: StatItem[] = [];

  // === Options ligne 1 (5 cards) ===
  const line1Options = jewelTypes;

  // === Options ligne 2 (4 cards) — dépend de ligne 1 ===
  $: line2Options = getLine2Options($selectedLine1);

  function getLine2Options(selected: number): Line2Option[] {
    const map: Record<string, Line2Option[]> = {
      option1: [
        { value: 'sub1a', label: 'Sub 1A' },
        { value: 'sub1b', label: 'Sub 1B' },
        { value: 'sub1c', label: 'Sub 1C' },
        { value: 'sub1d', label: 'Sub 1D' }
      ],
      option2: [
        { value: 'sub2a', label: 'Sub 2A' },
        { value: 'sub2b', label: 'Sub 2B' },
        { value: 'sub2c', label: 'Sub 2C' },
        { value: 'sub2d', label: 'Sub 2D' }
      ],
      option3: [
        { value: 'sub3a', label: 'Sub 3A' },
        { value: 'sub3b', label: 'Sub 3B' },
        { value: 'sub3c', label: 'Sub 3C' },
        { value: 'sub3d', label: 'Sub 3D' }
      ],
      option4: [
        { value: 'sub4a', label: 'Sub 4A' },
        { value: 'sub4b', label: 'Sub 4B' },
        { value: 'sub4c', label: 'Sub 4C' },
        { value: 'sub4d', label: 'Sub 4D' }
      ],
      option5: [
        { value: 'sub5a', label: 'Sub 5A' },
        { value: 'sub5b', label: 'Sub 5B' },
        { value: 'sub5c', label: 'Sub 5C' },
        { value: 'sub5d', label: 'Sub 5D' }
      ]
    };

    return map[selected] || map.option1;
  }

  // === Autocomplete stats (exemple de données) ===
  const statOptions: string[] = [
    'HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed',
    'Accuracy', 'Evasion', 'Crit Rate', 'IV HP', 'IV Atk'
  ];

  // === Ajouter une stat ===
  function addStat() {
    if (!searchValue.trim()) return;

    const exists = statsArray.some(s => s.name === searchValue);
    if (exists) return;

    statsArray = [
      ...statsArray,
      { name: searchValue, weight: 1, minWeight: 0 }
    ];
    searchValue = '';
  }

  // === Supprimer une stat ===
  function removeStat(index: number) {
    statsArray = statsArray.filter((_, i) => i !== index);
  }

  // === Soumission finale ===
  function handleSearch() {
    // Synchronise les stores avant traitement
    selectedSeed.set(seedInput);
    selectedStats.set(statsArray);

    // Tu feras ton traitement ici
    console.log('Submit:', {
      line1: $selectedLine1,
      line2: $selectedLine2,
      mode,
      seed: seedInput,
      stats: statsArray
    });

    // Exemple : alert ou appel API
    alert('Recherche lancée ! (voir console)');
  }

  // Réactivité : synchroniser seedInput avec mode
  $: if (mode === 'seed') {
    seedInput = $selectedSeed;
  }

  $: {
    const newOptions = getLine2Options($selectedLine1);

    // Si la valeur actuelle de line2 n'existe plus dans les nouvelles options
    if (!newOptions.some(opt => opt.value === $selectedLine2)) {
      selectedLine2.set('');
      // Optionnel : reset mode + stats
      mode = null;
      statsArray = [];
      selectedStats.set([]);
      seedInput = '';
      selectedSeed.set('');
    }
  }
</script>

<!-- Burger Button -->
<button on:click={() => (isOpen = !isOpen)} class="burger" aria-label="Toggle menu">
  <span></span><span></span><span></span>
</button>

<!-- Sidebar -->
{#if isOpen}
  <aside class="sidebar">
    <!-- Ligne 1 : 5 cards radio -->
    <section class="line line1">
      {#each line1Options as opt}
        <label class="card" class:selected={$selectedLine1 === opt.id}>
          <input
            type="radio"
            bind:group={$selectedLine1}
            value={opt.id}
          />
          <div class="card-label">{opt.label}</div>
        </label>
      {/each}
    </section>

    {#if $selectedLine1}
      <!-- Ligne 2 : 4 cards radio (dépend de ligne 1) -->
      <section class="line line2">
        {#each line2Options as opt}
          <label class="card" class:selected={$selectedLine2 === opt.value}>
            <input
              type="radio"
              bind:group={$selectedLine2}
              value={opt.value}
            />
            <div class="card-label">{opt.label}</div>
          </label>
        {/each}
      </section>
      {#if $selectedLine2}
        <!-- Ligne 3 : Choix du mode -->
        <section class="line line3">
          <button
            on:click={() => (mode = 'seed')}
            class:active={mode === 'seed'}
          >
            Enter seed
          </button>
          <button
            on:click={() => (mode = 'stats')}
            class:active={mode === 'stats'}
          >
            Select stats
          </button>
        </section>

        <!-- Mode Seed -->
        {#if mode === 'seed'}
          <div class="mode-content seed">
            <input
              type="number"
              bind:value={seedInput}
              placeholder="Entrez la seed"
              min="0"
              step="1"
            />
          </div>
        {/if}

        <!-- Mode Stats -->
        {#if mode === 'stats'}
          <div class="mode-content stats">
            <!-- Recherche avec autocomplete -->
            <div class="search-input">
              <input
                type="text"
                bind:value={searchValue}
                list="stats-datalist"
                placeholder="Rechercher une stat..."
                on:keydown={(e) => e.key === 'Enter' && addStat()}
              />
              <datalist id="stats-datalist">
                {#each statOptions as stat}
                  <option value={stat} />
                {/each}
              </datalist>
              <button on:click={addStat} disabled={!searchValue.trim()}>
                Ajouter
              </button>
            </div>

            <!-- Liste des stats ajoutées -->
            <div class="stats-list">
              {#each statsArray as stat, i}
                <div class="stat-row">
                  <span class="stat-name">{stat.name}</span>
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
                  <button on:click={() => removeStat(i)} class="delete">Supprimer</button>
                </div>
              {/each}
              {#if statsArray.length === 0}
                <p class="empty">Aucune stat sélectionnée</p>
              {/if}
            </div>
          </div>
        {/if}
      {/if}
    {/if}

    <!-- Bouton de recherche -->
    <button class="search-btn" on:click={handleSearch}>
      Search
    </button>
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
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    z-index: 999;
  }

  .line {
    margin-bottom: 1.5rem;
  }

  .line1, .line2 {
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

  .search-input {
    display: flex;
    gap: 0.5rem;
  }
  .search-input input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
  }
  .search-input button {
    padding: 0 1rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .search-input button:disabled {
    background: #6c757d;
    cursor: not-allowed;
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
</style>