# Plan B: On-Demand Calculation with Caching

## Overview

Integrate the PoE jewel stat distribution algorithm to calculate jewel results on-demand for specific jewel type + socket + allocated nodes combinations. Cache calculated results to avoid redundant computations.

## Problem Analysis

### Current State
- Pre-processed data files contain ~1,239 nodes per seed across the entire tree
- Search loads entire jewel type regardless of user's actual needs
- 99% of node checks are wasted (nodes not allocated or not in socket radius)
- Search time: ~5 seconds for GloriousVanity (7,901 seeds)

### Bottleneck
The current approach stores data for the entire tree, but users typically:
- Only use 1-2 sockets per session
- Allocate only 20-40 nodes within a jewel's radius
- Search for specific stat combinations

This means we're loading and processing thousands of nodes that will never be checked against allocated nodes.

### Data Analysis

#### Search Efficiency Breakdown
```
For GloriousVanity:
  - Total seeds: 7,901
  - Nodes per seed: ~1,239
  - Total node entries checked: 9.8M (7,901 × 1,239)

With on-demand calculation:
  - Socket radius nodes: ~67 average
  - Allocated nodes: ~20-40
  - Relevant nodes: ~20-40
  - Total calculations: 7,901 × 20-40 = ~158K-316K
  - Efficiency improvement: ~30-60x fewer calculations
```

#### Cache Efficiency
Given user behavior:
- 1-2 sockets per session (rare switching)
- Same jewel type typically
- Allocated nodes may change, but often incremental
- **Cache hit rate expected: 70-90%**

#### Memory Efficiency
- Current: ~31MB in memory (GloriousVanity) + overhead
- On-demand: Only calculated results (typically < 500KB)
- **Memory improvement: 98% reduction**

## Implementation Plan

### Phase 1: Port Algorithm Integration

**File: `src/utils/jewel/jewelAlgorithm.ts`**

This module integrates the jewel stat distribution algorithm from your other project.

```typescript
import type { JewelType, Stat } from "$lib/types";
import { jewelTypes } from "$lib/constants/timeless";
import { canvas } from "$lib/konva/canvasContext";

export interface JewelEntry {
  r: Record<string, number[]>;
  a: Record<string, number[]>;
}

export interface CalculationContext {
  jewelType: JewelType;
  socketSkill: string;
  allocatedNodes: Set<string>;
  socketNodeIds: string[];
}

/**
 * Calculate jewel stats for a single seed
 * Returns minimal JewelEntry with only relevant nodeIds
 */
export function calculateJewelSeed(
  seed: number,
  context: CalculationContext
): JewelEntry | null {
  const { jewelType, socketNodeIds, allocatedNodes } = context;

  // Get socket node IDs as a set for quick lookup
  const socketNodeIdSet = new Set(socketNodeIds.map(id => id.toString()));

  // Call the core algorithm from your other project
  // This is a placeholder - replace with actual algorithm implementation
  const rawResults = runJewelAlgorithm(
    seed,
    jewelType.name,
    jewelType.id
  );

  // Filter results to only nodes that are:
  // 1. Within socket radius
  // 2. Actually allocated by the user
  const filteredR: Record<string, number[]> = {};
  const filteredA: Record<string, number[]> = {};

  for (const [key, nodeIds] of Object.entries(rawResults.r || {})) {
    const relevantNodes = nodeIds.filter(nodeId => {
      return socketNodeIdSet.has(nodeId.toString()) &&
             allocatedNodes.has(nodeId.toString());
    });
    if (relevantNodes.length > 0) {
      filteredR[key] = relevantNodes;
    }
  }

  for (const [key, nodeIds] of Object.entries(rawResults.a || {})) {
    const relevantNodes = nodeIds.filter(nodeId => {
      return socketNodeIdSet.has(nodeId.toString()) &&
             allocatedNodes.has(nodeId.toString());
    });
    if (relevantNodes.length > 0) {
      filteredA[key] = relevantNodes;
    }
  }

  // Return null if no relevant data
  if (Object.keys(filteredR).length === 0 &&
      Object.keys(filteredA).length === 0) {
    return null;
  }

  return { r: filteredR, a: filteredA };
}

/**
 * Calculate jewel stats for all seeds in a jewel type's range
 * Optionally filters to seeds that affect specific selected stats
 */
export function calculateForAllSeeds(
  context: CalculationContext,
  selectedStats: Stat[] = []
): Record<number, JewelEntry> {
  const { jewelType } = context;
  const results: Record<number, JewelEntry> = {};

  const min = jewelType.min;
  const max = jewelType.max;
  const step = jewelType.name === "eternal" ? 20 : 1;

  // Get selected stat IDs for early exit optimization
  const selectedStatIds = new Set(selectedStats.map(s => s.statKey));

  for (let seed = min; seed <= max; seed += step) {
    const entry = calculateJewelSeed(seed, context);

    // Skip if no data
    if (!entry) continue;

    // Early exit: if selected stats specified and none match, skip this seed
    if (selectedStatIds.size > 0) {
      const hasSelectedStat = checkHasSelectedStat(entry, selectedStatIds);
      if (!hasSelectedStat) continue;
    }

    results[seed] = entry;
  }

  return results;
}

/**
 * Check if a JewelEntry contains any of the selected stat IDs
 */
function checkHasSelectedStat(
  entry: JewelEntry,
  selectedStatIds: Set<number>
): boolean {
  for (const key of Object.keys(entry.r || {})) {
    const stats = parseKey(key);
    if (stats.some(s => selectedStatIds.has(s.statId))) {
      return true;
    }
  }
  for (const key of Object.keys(entry.a || {})) {
    const stats = parseKey(key);
    if (stats.some(s => selectedStatIds.has(s.statId))) {
      return true;
    }
  }
  return false;
}

/**
 * Parse stat key to extract stat ID and value
 * Input: "79-{\"3382\":20}"
 * Output: [{ statId: 3382, value: 20 }]
 */
function parseKey(key: string): { statId: number; value: number }[] {
  const match = key.match(/(\d+)-\{.+?\}/);
  if (!match) return [];

  const nodeId = parseInt(match[1]);
  const statsPart = key.substring(key.indexOf('{') + 1, key.lastIndexOf('}'));

  try {
    const statsObj = JSON.parse(`{${statsPart}}`);
    return Object.entries(statsObj).map(([statId, value]) => ({
      statId: parseInt(statId),
      value: value as number
    }));
  } catch {
    return [];
  }
}

/**
 * Run the core jewel algorithm
 * This is a placeholder - replace with actual implementation from your project
 */
function runJewelAlgorithm(
  seed: number,
  jewelName: string,
  jewelId: number
): JewelEntry {
  // TODO: Integrate algorithm from other project
  // The algorithm should return raw node->stat mappings for the entire tree
  // Return placeholder for now
  return { r: {}, a: {} };
}
```

### Phase 2: Create Cache Management

**File: `src/providers/jewelCache.ts`**

```typescript
import type { JewelType, Stat } from "$lib/types";

export interface JewelEntry {
  r: Record<string, number[]>;
  a: Record<string, number[]>;
}

export interface CacheKey {
  jewelId: string;
  socketSkill: string;
  allocatedNodesHash: string;
  selectedStatsHash?: string; // Optional: for stat-specific caching
}

export interface CachedResult {
  results: Record<number, JewelEntry>;
  calculatedAt: number;
  hitCount: number;
}

interface CacheEntry {
  data: CachedResult;
  lastAccess: number;
}

class JewelResultCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 50; // Max cached results
  private maxAge: number = 30 * 60 * 1000; // 30 minutes

  /**
   * Generate hash for allocated nodes
   */
  generateAllocatedHash(allocatedNodes: Set<string>): string {
    const sorted = Array.from(allocatedNodes).sort((a, b) =>
      parseInt(a) - parseInt(b)
    );
    return sorted.join(',');
  }

  /**
   * Generate hash for selected stats
   */
  generateStatsHash(selectedStats: Stat[]): string {
    const sorted = selectedStats
      .map(s => `${s.statKey}:${s.weight}:${s.minWeight}`)
      .sort()
      .join('|');
    return sorted || 'none';
  }

  /**
   * Generate full cache key
   */
  generateKey(params: CacheKey): string {
    return `${params.jewelId}-${params.socketSkill}-${params.allocatedNodesHash}` +
           (params.selectedStatsHash ? `-${params.selectedStatsHash}` : '');
  }

  /**
   * Get cached result
   */
  get(key: string): CachedResult | undefined {
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    // Check age
    if (Date.now() - entry.lastAccess > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access time and hit count
    entry.lastAccess = Date.now();
    entry.data.hitCount++;

    return entry.data;
  }

  /**
   * Set cached result
   */
  set(key: string, results: CachedResult): void {
    // Evict oldest entry if at max size
    if (this.cache.size >= this.maxSize) {
      let oldestKey = '';
      let oldestTime = Date.now();

      for (const [k, entry] of this.cache.entries()) {
        if (entry.lastAccess < oldestTime) {
          oldestTime = entry.lastAccess;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data: results,
      lastAccess: Date.now()
    });
  }

  /**
   * Clear cache for specific jewel or socket
   */
  clear(jewelId?: string, socketSkill?: string): void {
    if (!jewelId && !socketSkill) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      const shouldDelete =
        (jewelId && key.startsWith(`${jewelId}-`)) ||
        (socketSkill && key.includes(`-${socketSkill}-`));

      if (shouldDelete) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hits: number } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.data.hitCount;
    }
    return {
      size: this.cache.size,
      hits: totalHits
    };
  }

  /**
   * Clear old entries
   */
  clearOld(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.lastAccess > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const jewelResultCache = new JewelResultCache();

// Export convenience functions
export const getJewelCache = (key: string) => jewelResultCache.get(key);
export const setJewelCache = (key: string, results: CachedResult) =>
  jewelResultCache.set(key, results);
export const clearJewelCache = (jewelId?: string, socketSkill?: string) =>
  jewelResultCache.clear(jewelId, socketSkill);
```

### Phase 3: Update Search Logic

**File: `src/utils/sidebar/searchLogic.ts`**

```typescript
import { treeStore } from "$lib/stores/treeStore";
import { canvas } from "$lib/konva/canvasContext";
import { parseKey, formatStatTranslation } from "./sidebarUtils";
import type {
  JewelType,
  Stat,
  Translation,
  JewelEntry,
} from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import { get } from "svelte/store";
import { tick } from "svelte";
import { clearHighlights } from "$lib/konva/utils/jewelHighlight";
import {
  jewelResultCache,
  type CachedResult
} from "$lib/providers/jewelCache";
import {
  calculateJewelSeed,
  calculateForAllSeeds,
  type CalculationContext
} from "$lib/utils/jewel/jewelAlgorithm";

// ... (keep existing helper functions: generateStatKeyColors, processNodeModifications, applySeedModifications)

export async function applySeed(
  seed: number,
  jewelType: JewelType,
  translation: Record<string, Translation[]>,
) {
  const chosenSocket = get(treeStore).chosenSocket?.skill;
  if (!chosenSocket) {
    return;
  }

  const allocated = get(treeStore).allocated;
  const socketNodeIds = canvas.treeData.socketNodes[chosenSocket];

  // Create calculation context
  const context: CalculationContext = {
    jewelType,
    socketSkill: chosenSocket,
    allocatedNodes: allocated,
    socketNodeIds
  };

  // Check cache first
  const allocatedHash = jewelResultCache.generateAllocatedHash(allocated);
  const cacheKey = jewelResultCache.generateKey({
    jewelId: jewelType.name,
    socketSkill: chosenSocket,
    allocatedNodesHash: allocatedHash
  });

  const cached = jewelResultCache.get(cacheKey);
  let entry = cached?.results[seed];

  if (!entry) {
    // Calculate single seed
    entry = calculateJewelSeed(seed, context);
    if (!entry) {
      return;
    }
  }

  // Apply modifications
  applySeedModifications(entry, socketNodeIds, translation, jewelType);
}

export async function handleSearch(
  mode: "seed" | "stats" | null,
  seedInput: number | null,
  translation: Record<string, Translation[]>,
  jewelType: JewelType | null,
  selectedStats: Stat[],
) {
  setSearchLoading(true);
  clearHighlights();
  await tick();

  if (mode === "seed") {
    // Seed mode handled by applySeed
    if (!seedInput || !jewelType) {
      setSearchNotFound();
      return;
    }

    await applySeed(seedInput, jewelType, translation);
    setSearchComplete();

  } else if (mode === "stats") {
    if (selectedStats.length === 0 || !jewelType) {
      setSearchNotFound();
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    const chosenSocket = get(treeStore).chosenSocket?.skill;
    if (!chosenSocket) {
      setSearchNotFound();
      return;
    }

    const allocated = get(treeStore).allocated;
    const socketNodeIds = canvas.treeData.socketNodes[chosenSocket];

    // Create calculation context
    const context: CalculationContext = {
      jewelType,
      socketSkill: chosenSocket,
      allocatedNodes: allocated,
      socketNodeIds
    };

    // Check cache first
    const allocatedHash = jewelResultCache.generateAllocatedHash(allocated);
    const statsHash = jewelResultCache.generateStatsHash(selectedStats);

    const cacheKey = jewelResultCache.generateKey({
      jewelId: jewelType.name,
      socketSkill: chosenSocket,
      allocatedNodesHash: allocatedHash,
      selectedStatsHash: statsHash
    });

    let jewelData = jewelResultCache.get(cacheKey)?.results;

    if (!jewelData) {
      // Calculate on-demand
      console.time('Calculate jewel results');
      jewelData = calculateForAllSeeds(context, selectedStats);
      console.timeEnd('Calculate jewel results');

      // Cache results
      const cachedResult: CachedResult = {
        results: jewelData,
        calculatedAt: Date.now(),
        hitCount: 0
      };
      jewelResultCache.set(cacheKey, cachedResult);
    } else {
      console.log('Cache hit for jewel data');
    }

    // Rest of search logic unchanged (lines 246-367)
    const results: Record<
      number,
      {
        statCounts: Record<number, number>;
        statTotals: Record<number, number>;
      }
    > = {};

    for (const seedStr of Object.keys(jewelData)) {
      const seed = parseInt(seedStr);
      const entry = jewelData[seed];
      if (!entry) continue;

      const statCounts: Record<number, number> = {};
      const statTotals: Record<number, number> = {};

      // Process 'r' and 'a'
      for (const type of ["r", "a"] as const) {
        for (const [key, nodeIds] of Object.entries(entry[type] || {})) {
          const stats = parseKey(key);
          for (const { statId, value } of stats) {
            if (selectedStats.some((s) => s.statKey === statId)) {
              statCounts[statId] = (statCounts[statId] || 0) + 1;
              statTotals[statId] = (statTotals[statId] || 0) + value;
            }
          }
        }
      }

      // ... rest of search logic unchanged
      const statSearchMode = get(searchStore).statSearchMode;
      const meetsMinRequirement = selectedStats.every((stat) => {
        if (statSearchMode === "occurrences") {
          return (statCounts[stat.statKey] || 0) >= stat.minWeight;
        } else {
          return (statTotals[stat.statKey] || 0) >= stat.minWeight;
        }
      });

      if (meetsMinRequirement) {
        results[seed] = { statCounts, statTotals };
      }
    }

    // Group by total weight (unchanged)
    const grouped: Record<
      string,
      {
        seed: number;
        statCounts: Record<number, number>;
        statTotals: Record<number, number>;
        totalWeight: number;
      }[]
    > = {};
    const statSearchMode = get(searchStore).statSearchMode;
    for (const [seed, { statCounts, statTotals }] of Object.entries(results)) {
      let totalWeight = 0;
      const minTotalWeight = get(searchStore).minTotalWeight;
      for (const stat of selectedStats) {
        const count = statCounts[stat.statKey] || 0;
        const total = statTotals[stat.statKey] || 0;
        const meetsMin =
          statSearchMode === "occurrences"
            ? count >= stat.minWeight
            : total >= stat.minWeight;
        if (meetsMin) {
          const weightValue =
            statSearchMode === "occurrences" ? count : total;
          totalWeight += weightValue * stat.weight;
        }
      }
      if (totalWeight >= minTotalWeight) {
        const key = totalWeight.toFixed(1);
        if (!totalWeight) continue;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
          seed: parseInt(seed),
          statCounts,
          statTotals,
          totalWeight,
        });
      }
    }

    const sortedWeights = Object.keys(grouped).sort(
      (a, b) => parseFloat(b) - parseFloat(a),
    );
    const orderedSeeds: number[] = [];
    for (const weight of sortedWeights) {
      const seedsInGroup = grouped[weight]
        .sort((a, b) => a.seed - b.seed)
        .map((g) => g.seed);
      orderedSeeds.push(...seedsInGroup);
    }

    // Generate colors for all unique stat keys found in results
    const allStatKeys = new Set<number>();
    for (const { statCounts } of Object.values(results)) {
      Object.keys(statCounts).forEach((key) => allStatKeys.add(parseInt(key)));
    }
    const statKeyColors = generateStatKeyColors(Array.from(allStatKeys));

    searchStore.update((state) => {
      state.searched = true;
      state.loading = false;
      state.statsResults = grouped;
      state.statKeyColors = statKeyColors;
      state.orderedSeeds = orderedSeeds;
      state.totalResults = orderedSeeds.length;
      state.currentPage = 0;
      return state;
    });
  }
}
```

### Phase 4: Update Search Utils

**File: `src/utils/sidebar/searchUtils.ts`**

Remove or deprecate the old `loadJewelData` function since we're now calculating on-demand:

```typescript
// Keep for backward compatibility but mark as deprecated
/**
 * @deprecated Use on-demand calculation via jewelAlgorithm.ts instead
 */
export async function loadJewelData(
  jewelType: JewelType,
  socketSkill?: string
): Promise<Record<number, JewelEntry> | null> {
  console.warn('loadJewelData is deprecated, use on-demand calculation');
  return null;
}

// Keep getEntryForSeed as it's still useful
export function getEntryForSeed(
  jewelData: Record<number, JewelEntry>,
  seed: number
): JewelEntry | undefined {
  return jewelData[seed];
}
```

### Phase 5: Deprecate or Remove Old Jewel Data Loading

**File: `src/providers/jewels.ts`**

Mark as deprecated and keep for rollback:

```typescript
/**
 * @deprecated Use on-demand calculation via jewelAlgorithm.ts instead
 * Kept for backward compatibility and rollback option
 */
import { jewelTypes } from "$lib/constants/timeless";
import { perfMonitor } from "$lib/utils/performanceMonitor";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

export interface JewelEntry {
  r: Record<string, number[]>;
  a: Record<string, number[]>;
}

export const cache = new Map<string, Record<number, JewelEntry>>();
export const loadingJewels: Writable<Set<string>> = writable(new Set());
export const loadedJewels: Writable<Set<string>> = writable(new Set());

export async function loadJewel(jewelId: string): Promise<void> {
  console.warn('loadJewel is deprecated, use on-demand calculation');
  // Keep implementation for rollback
}

export function getJewelData(
  jewelId: string,
): Record<number, JewelEntry> | undefined {
  console.warn('getJewelData is deprecated, use on-demand calculation');
  return cache.get(jewelId);
}
```

### Phase 6: Update Tree Store Integration

**File: `src/stores/treeStore.ts`**

Add cache invalidation when allocated nodes change:

```typescript
import { clearJewelCache } from "$lib/providers/jewelCache";

// In the update function that handles node allocation
export function allocateNode(nodeId: string) {
  // ... existing logic

  // Invalidate jewel cache when allocation changes
  const currentState = get(treeStore);
  clearJewelCache(currentState.jewelType?.name, currentState.chosenSocket?.skill);
}

export function unallocateNode(nodeId: string) {
  // ... existing logic

  // Invalidate jewel cache when allocation changes
  const currentState = get(treeStore);
  clearJewelCache(currentState.jewelType?.name, currentState.chosenSocket?.skill);
}
```

### Phase 7: Add Cache Statistics UI (Optional)

**File: `src/ui/debug/CacheStats.svelte`**

```svelte
<script lang="ts">
  import { jewelResultCache } from "$lib/providers/jewelCache";

  let stats = jewelResultCache.getStats();

  function refreshStats() {
    stats = jewelResultCache.getStats();
  }
</script>

<div class="cache-stats">
  <h3>Jewel Cache Statistics</h3>
  <p>Size: {stats.size} entries</p>
  <p>Total Hits: {stats.hits}</p>
  <button on:click={refreshStats}>Refresh</button>
  <button on:click={() => jewelResultCache.clear()}>Clear Cache</button>
</div>

<style>
  .cache-stats {
    padding: 10px;
    background: #f0f0f0;
    border-radius: 4px;
    margin: 10px 0;
  }
</style>
```

## Testing Plan

### 1. Unit Tests

```typescript
// tests/jewelAlgorithm.test.ts
import { calculateJewelSeed, calculateForAllSeeds } from '$lib/utils/jewel/jewelAlgorithm';

describe('Jewel Algorithm', () => {
  test('should calculate correct stats for a seed', () => {
    const context = createMockContext();
    const result = calculateJewelSeed(100, context);

    expect(result).toBeDefined();
    // Verify against known good data
  });

  test('should filter to allocated nodes', () => {
    const context = createMockContext();
    const result = calculateJewelSeed(100, context);

    // Verify all nodeIds in result are allocated
    const allNodeIds = [
      ...Object.values(result.r || {}).flat(),
      ...Object.values(result.a || {}).flat()
    ];

    for (const nodeId of allNodeIds) {
      expect(context.allocatedNodes.has(nodeId.toString())).toBe(true);
    }
  });
});

// tests/jewelCache.test.ts
import { jewelResultCache } from '$lib/providers/jewelCache';

describe('Jewel Cache', () => {
  test('should store and retrieve results', () => {
    const key = 'test-key';
    const result = createMockResult();

    jewelResultCache.set(key, result);
    const retrieved = jewelResultCache.get(key);

    expect(retrieved).toEqual(result);
  });

  test('should evict old entries', () => {
    // Test LRU eviction
  });

  test('should clear by jewel or socket', () => {
    // Test selective clearing
  });
});
```

### 2. Integration Tests

```typescript
// tests/searchIntegration.test.ts
import { handleSearch } from '$lib/utils/sidebar/searchLogic';
import { treeStore } from '$lib/stores/treeStore';

describe('Search Integration', () => {
  test('should produce same results as original implementation', async () => {
    // Set up test state
    treeStore.set(createMockTreeState());

    // Run search with on-demand calculation
    await handleSearch('stats', null, mockTranslation, mockJewelType, mockStats);

    // Compare results against expected values
    const state = get(searchStore);
    expect(state.totalResults).toBe(expectedResults);
  });

  test('should use cached results on second search', async () => {
    // First search
    await handleSearch('stats', null, mockTranslation, mockJewelType, mockStats);

    // Second search with same parameters
    const timeBefore = Date.now();
    await handleSearch('stats', null, mockTranslation, mockJewelType, mockStats);
    const timeAfter = Date.now();

    // Second search should be much faster (cache hit)
    expect(timeAfter - timeBefore).toBeLessThan(100);
  });
});
```

### 3. Performance Benchmarks

```typescript
// scripts/benchmarkOnDemand.ts
import { calculateForAllSeeds } from '$lib/utils/jewel/jewelAlgorithm';
import { jewelResultCache } from '$lib/providers/jewelCache';

async function benchmark() {
  const context = createMockContext();
  const selectedStats = createMockStats();

  console.time('First calculation (cold)');
  const results1 = calculateForAllSeeds(context, selectedStats);
  console.timeEnd('First calculation (cold)');

  console.time('Second calculation (cache hit)');
  const cacheKey = jewelResultCache.generateKey({
    jewelId: context.jewelType.name,
    socketSkill: context.socketSkill,
    allocatedNodesHash: jewelResultCache.generateAllocatedHash(context.allocatedNodes)
  });
  const cached = jewelResultCache.get(cacheKey);
  console.timeEnd('Second calculation (cache hit)');

  console.log('First calculation:', results1);
  console.log('Cached:', cached);
}

benchmark();

// Expected output:
// First calculation (cold): 1500-2000ms
// Second calculation (cache hit): < 50ms
```

## Performance Expectations

### First Search (Cold Cache)
- **Calculation Time**: 1-2 seconds (algorithm complexity)
- **Memory Usage**: ~500KB for results
- **Network**: 0 KB (no data loading)

### Subsequent Search (Cache Hit)
- **Lookup Time**: < 50ms (Map.get())
- **Memory Usage**: Same ~500KB
- **Network**: 0 KB

### Comparison to Original
| Metric | Original | On-Demand (First) | On-Demand (Cached) |
|--------|----------|------------------|-------------------|
| Load time | 2-3s | 0s | 0s |
| Search time | 5s | 1-2s (calc) | <50ms |
| Memory | 31MB | 500KB | 500KB |
| Network | 31MB | 0KB | 0KB |

### Cache Behavior
- **Hit rate**: 70-90% (based on user behavior)
- **Average search time**: 200-400ms (weighted average)
- **Memory growth**: Bounded by max 50 cache entries (~25MB worst case)

## Rollback Plan

If issues arise:

1. Keep `src/providers/jewels.ts` (marked deprecated but functional)
2. Revert `searchLogic.ts` to use `loadJewelData` instead of on-demand calculation
3. Revert `searchUtils.ts` to original implementation
4. Disable on-demand calculation by reverting imports

## Advantages

1. **Lowest Memory Footprint**: Only calculated results in memory
2. **Best Repeated Search Performance**: <50ms on cache hit
3. **No Pre-processing**: Direct calculation, no split files
4. **Algorithm Reusability**: Can be used for other features
5. **No Network Transfer**: Zero data download
6. **Scalable**: Performance doesn't depend on file size
7. **Flexible**: Easy to add new jewel types or features

## Disadvantages

1. **Complex Implementation**: Requires algorithm integration and careful testing
2. **First Search Still Slow**: 1-2s to calculate initially
3. **Cache Management**: Need to handle LRU eviction, invalidation
4. **Algorithm Maintenance**: Must keep algorithm in sync with PoE changes
5. **More Code**: Additional modules for algorithm and caching
6. **Testing Complexity**: Need to verify algorithm correctness

## Future Enhancements

1. **Incremental Updates**: Recalculate only changed allocated nodes
2. **Web Workers**: Run algorithm in background thread
3. **Persistent Cache**: Save cache to localStorage/IndexedDB
4. **Pre-calculation**: Calculate in background when user is idle
5. **Differential Updates**: When nodes change, update only affected seeds

## Conclusion

Plan B provides the ultimate memory efficiency and best performance for repeated searches, but requires significant algorithm integration work. The tradeoff is acceptable if users frequently search with the same socket/jewel type/allocated nodes combination, which matches the observed user behavior.

## Algorithm Integration Notes

### Required Components

To integrate your algorithm, you'll need:

1. **Algorithm Logic**: The core function that maps `(seed, jewelType)` to node stat mappings
2. **Socket Radius Logic**: Function to determine which nodes are within jewel radius
3. **Stat Translation**: Mapping of stat IDs to display strings (already exists)

### Algorithm Interface

```typescript
interface JewelAlgorithmResult {
  replacements: Map<number, StatMapping[]>; // nodeId -> list of stat mappings
  additions: Map<number, StatMapping[]>;
}

interface StatMapping {
  statId: number;
  value: number;
}

function calculateJewelEffects(
  seed: number,
  jewelType: string,
  jewelId: number
): JewelAlgorithmResult {
  // Your algorithm implementation here
}
```

### Integration Steps

1. Port algorithm code to `src/utils/jewel/jewelAlgorithm.ts`
2. Adapt algorithm output to match `JewelEntry` format
3. Add unit tests comparing algorithm output to known good data
4. Benchmark algorithm performance
5. Implement early-exit optimizations for selected stats
