# Plan A: Split Jewel Data Files by Socket

## Overview

Transform the current 5 jewel data files (one per jewel type) into 105 smaller files (21 sockets × 5 jewel types), each containing only data relevant to that specific socket's node radius.

## Problem Analysis

### Current State
- 5 jewel files: GloriousVanity (31MB), ElegantHubris (5.1MB), LethalPride (4.3MB), BrutalRestraint (4.1MB), MilitantFaith (1.9MB)
- Total: ~46MB compressed
- Each seed contains data for ~1,239 nodes across the entire tree
- When searching, the app loads the entire jewel type file regardless of which socket is selected
- Search time: ~5 seconds for GloriousVanity (7,901 seeds)

### Bottleneck
- During search, the code iterates through all 7,901 seeds
- For each seed, it checks ~1,239 nodes
- But only ~54-98 nodes are actually within the chosen socket's radius
- And only ~20-40 of those are allocated by the user
- **99% of node checks are wasted work**

### Data Analysis

#### Socket Node Counts (from tree.json)
```
Socket ID: Node Count
2491: 54 nodes
6230: 98 nodes
7960: 49 nodes
21984: 65 nodes
26196: 75 nodes
26725: 88 nodes
28475: 48 nodes
31683: 92 nodes
32763: 66 nodes
33631: 63 nodes
33989: 69 nodes
34483: 53 nodes
36634: 45 nodes
41263: 50 nodes
46882: 39 nodes
48768: 94 nodes
54127: 92 nodes
55190: 65 nodes
60735: 87 nodes
61419: 96 nodes
61834: 82 nodes

Total sockets: 21
Average nodes per socket: 67 nodes
```

#### Jewel Type Statistics
| Jewel Type | Seeds | Min | Max | Step | Current Size |
|-----------|-------|-----|-----|------|--------------|
| Glorious Vanity | 7,901 | 100 | 8,000 | 1 | 31MB |
| Lethal Pride | 8,001 | 10,000 | 18,000 | 1 | 4.3MB |
| Brutal Restraint | 7,501 | 500 | 8,000 | 1 | 4.1MB |
| Militant Faith | 8,001 | 2,000 | 10,000 | 1 | 1.9MB |
| Elegant Hubris | 7,900 | 2,000 | 160,000 | 20 | 5.1MB |

#### Estimated File Size Reduction
- Original: Each seed has ~1,239 nodes
- Per socket: Average 67 nodes (5.4% of original)
- **Expected reduction: ~95% per file**

#### New File Structure
```
Before:
  GloriousVanity.jsonl.gz           (31MB)
  ElegantHubris.jsonl.gz            (5.1MB)
  LethalPride.jsonl.gz              (4.3MB)
  BrutalRestraint.jsonl.gz          (4.1MB)
  MilitantFaith.jsonl.gz            (1.9MB)

After (105 files total):
  GloriousVanity-2491.jsonl.gz      (~1.5MB)
  GloriousVanity-6230.jsonl.gz      (~1.5MB)
  GloriousVanity-7960.jsonl.gz      (~1.5MB)
  ... (21 files per jewel type)
  ElegantHubris-2491.jsonl.gz       (~250KB)
  ... (21 files per jewel type)
  LethalPride-2491.jsonl.gz         (~210KB)
  ... (21 files per jewel type)
  BrutalRestraint-2491.jsonl.gz     (~200KB)
  ... (21 files per jewel type)
  MilitantFaith-2491.jsonl.gz       (~100KB)
  ... (21 files per jewel type)

Total: ~2.3MB (95% reduction from 46MB)
```

## Implementation Plan

### Phase 1: Create Pre-processing Script

**File: `scripts/splitJewelDataBySocket.ts`**

```typescript
import { gunzipSync } from 'zlib';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Configuration
const JEWEL_TYPES = [
  { label: "Glorious Vanity", name: "vaal", min: 100, max: 8000, step: 1 },
  { label: "Lethal Pride", name: "karui", min: 10000, max: 18000, step: 1 },
  { label: "Brutal Restraint", name: "maraketh", min: 500, max: 8000, step: 1 },
  { label: "Militant Faith", name: "templar", min: 2000, max: 10000, step: 1 },
  { label: "Elegant Hubris", name: "eternal", min: 2000, max: 160000, step: 20 },
];

interface JewelEntry {
  r: Record<string, number[]>;
  a: Record<string, number[]>;
}

// Load socket node mappings from tree.json
function loadSocketNodes(): Record<string, string[]> {
  const treeData = JSON.parse(readFileSync('src/data/tree.json', 'utf-8'));
  return treeData.socketNodes;
}

// Load jewel data file
function loadJewelData(fileName: string): string {
  const compressed = readFileSync(`src/data/jewels/${fileName}`);
  return gunzipSync(compressed).toString('utf-8');
}

// Process jewel data and split by socket
function processJewel(jewelType: typeof JEWEL_TYPES[0], socketNodes: Record<string, string[]>) {
  console.log(`Processing ${jewelType.label}...`);

  const fileName = `${jewelType.label.replace(/\s+/g, "")}.jsonl.gz`;
  const text = loadJewelData(fileName);
  const lines = text.trim().split('\n').filter(Boolean);

  // Create output directory if needed
  const outputDir = 'src/data/jewels/split';
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Initialize output buffers for each socket
  const socketOutputs: Record<string, string[]> = {};
  for (const socketId of Object.keys(socketNodes)) {
    socketOutputs[socketId] = [];
  }

  // Process each seed
  let seed = jewelType.min;
  for (const line of lines) {
    const entry = JSON.parse(line) as JewelEntry;

    // Filter entry by each socket
    for (const [socketId, socketNodeIds] of Object.entries(socketNodes)) {
      const socketNodeIdSet = new Set(socketNodeIds);

      // Filter 'r' entries
      const filteredR: Record<string, number[]> = {};
      for (const [key, nodeIds] of Object.entries(entry.r || {})) {
        const filtered = nodeIds.filter(id => socketNodeIdSet.has(id.toString()));
        if (filtered.length > 0) {
          filteredR[key] = filtered;
        }
      }

      // Filter 'a' entries
      const filteredA: Record<string, number[]> = {};
      for (const [key, nodeIds] of Object.entries(entry.a || {})) {
        const filtered = nodeIds.filter(id => socketNodeIdSet.has(id.toString()));
        if (filtered.length > 0) {
          filteredA[key] = filtered;
        }
      }

      // Only include if socket has relevant data
      if (Object.keys(filteredR).length > 0 || Object.keys(filteredA).length > 0) {
        const filteredEntry: JewelEntry = { r: filteredR, a: filteredA };
        socketOutputs[socketId].push(`${JSON.stringify(filteredEntry)}`);
      }
    }

    seed += jewelType.step;
  }

  // Write output files for this jewel type
  for (const [socketId, outputLines] of Object.entries(socketOutputs)) {
    if (outputLines.length === 0) {
      console.log(`  Skipping ${jewelType.label}-${socketId} (no data)`);
      continue;
    }

    const outputFileName = `${jewelType.label.replace(/\s+/g, "")}-${socketId}.jsonl`;
    const outputPath = join(outputDir, outputFileName);
    writeFileSync(outputPath, outputLines.join('\n') + '\n');

    // Compress with gzip
    const { execSync } = require('child_process');
    execSync(`gzip -f "${outputPath}"`);

    console.log(`  Created ${outputFileName}.gz (${outputLines.length} seeds)`);
  }
}

// Main execution
function main() {
  console.log('Loading socket data...');
  const socketNodes = loadSocketNodes();
  console.log(`Found ${Object.keys(socketNodes).length} sockets\n`);

  for (const jewelType of JEWEL_TYPES) {
    processJewel(jewelType, socketNodes);
  }

  console.log('\nDone!');
}

main();
```

### Phase 2: Update File Structure

Create new directory structure:
```
src/data/jewels/
  ├── split/                          # New directory
  │   ├── GloriousVanity-2491.jsonl.gz
  │   ├── GloriousVanity-6230.jsonl.gz
  │   ├── ... (105 files total)
  │   └── MilitantFaith-61834.jsonl.gz
  └── legacy/                        # Backup original files (optional)
      ├── GloriousVanity.jsonl.gz
      ├── ElegantHubris.jsonl.gz
      └── ...
```

### Phase 3: Modify `src/providers/jewels.ts`

**Changes needed:**

1. Update cache structure to include socket
2. Add socket parameter to `loadJewel` function
3. Update file naming logic

```typescript
// Update cache key structure
const cache = new Map<string, Record<number, JewelEntry>>();
// Key format: "jewelId-socketId" (e.g., "vaal-2491", "vaal-6230")

// Update loadJewel function signature
export async function loadJewel(
  jewelId: string,
  socketSkill: string
): Promise<void> {
  const cacheKey = `${jewelId}-${socketSkill}`;

  // Check if already loaded
  if (cache.has(cacheKey)) {
    return;
  }

  const jewel = jewelTypes.find((j) => j.name === jewelId);
  if (!jewel) {
    throw new Error(`Unknown jewel type: ${jewelId}`);
  }

  // New file naming: GloriousVanity-2491.jsonl.gz
  const fileName = `${jewel.label.replace(/\s+/g, "")}-${socketSkill}.jsonl.gz`;
  const url = `/src/data/jewels/split/${fileName}`;

  loadingJewels.update((s) => new Set(s).add(jewelId));

  try {
    perfMonitor.mark(jewel.label + " preload-start");
    const text = await fetchText(url);
    perfMonitor.mark(jewel.label + " preload-end");
    perfMonitor.measure(
      jewel.label + " preload",
      jewel.label + " preload-start",
      jewel.label + " preload-end",
    );

    const lines = text.trim().split("\n").filter(Boolean);
    const data: Record<number, JewelEntry> = {};
    let i = jewel.min;
    const step = jewelId === "eternal" ? 20 : 1;

    for (const line of lines) {
      const entry = JSON.parse(line) as JewelEntry;
      data[i] = entry;
      i += step;
    }

    cache.set(cacheKey, data);
    loadedJewels.update((s) => new Set(s).add(jewelId));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to load ${fileName}: ${message}`);
  } finally {
    loadingJewels.update((s) => {
      const next = new Set(s);
      next.delete(jewelId);
      return next;
    });
  }
}

// Update getJewelData to accept socket
export function getJewelData(
  jewelId: string,
  socketSkill: string
): Record<number, JewelEntry> | undefined {
  const cacheKey = `${jewelId}-${socketSkill}`;
  return cache.get(cacheKey);
}
```

### Phase 4: Update `src/utils/sidebar/searchUtils.ts`

```typescript
// Update loadJewelData function
export async function loadJewelData(
  jewelType: JewelType,
  socketSkill?: string
): Promise<Record<number, JewelEntry> | null> {
  if (!socketSkill) {
    console.warn("loadJewelData called without socketSkill");
    return null;
  }

  try {
    await loadJewel(jewelType.name, socketSkill);
    return getJewelData(jewelType.name, socketSkill);
  } catch (err) {
    console.error(`Failed to load jewel data:`, err);
    return null;
  }
}

// Update getEntryForSeed (no changes needed, just called with updated context)
export function getEntryForSeed(
  jewelData: Record<number, JewelEntry>,
  seed: number
): JewelEntry | undefined {
  return jewelData[seed];
}
```

### Phase 5: Update `src/utils/sidebar/searchLogic.ts`

**In `applySeed` function (line 158):**

```typescript
export async function applySeed(
  seed: number,
  jewelType: JewelType,
  translation: Record<string, Translation[]>,
) {
  // Pass socket skill to loadJewelData
  const jewelData = await loadJewelData(jewelType, chosenSocket?.skill);
  if (!jewelData) {
    return;
  }
  const entry = getEntryForSeed(jewelData, seed);
  // ... rest of function unchanged
}
```

**In `handleSearch` function (line 189):**

```typescript
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
    // ... existing code

    // Update line 241: Pass socket skill
    const chosenSocket = get(treeStore).chosenSocket?.skill;
    if (!chosenSocket) {
      setSearchNotFound();
      return;
    }

    const jewelData = await loadJewelData(jewelType, chosenSocket);
    // ... rest of function unchanged
  } else if (mode === "stats") {
    // ... existing code

    // Update line 241: Pass socket skill
    const chosenSocket = get(treeStore).chosenSocket?.skill;
    if (!chosenSocket) {
      setSearchNotFound();
      return;
    }

    const jewelData = await loadJewelData(jewelType, chosenSocket);
    // ... rest of search logic unchanged
  }
}
```

### Phase 6: Update Type Definitions

**File: `src/types.ts`**

No changes needed - `JewelEntry` interface remains the same.

### Phase 7: Update Svelte Components

Check for any components that call `loadJewel` or `getJewelData` directly:

- `src/ui/sidebar/` - Sidebar components that trigger search
- `src/ui/search/` - Search-related components

Update to pass `socketSkill` parameter where needed.

## Testing Plan

### 1. Unit Tests
```typescript
// tests/jewelSplit.test.ts
describe('Jewel data splitting', () => {
  test('should filter nodes by socket radius', () => {
    // Verify that split files contain only relevant nodes
  });

  test('should maintain seed consistency across split files', () => {
    // Ensure seed 1234 in split file matches original data for that socket
  });

  test('should handle sockets with no data', () => {
    // Some sockets may have no data for certain jewel types
  });
});
```

### 2. Integration Tests
- Load split jewel data and verify search results match original implementation
- Test with all 5 jewel types
- Test with all 21 sockets
- Compare search results before and after changes

### 3. Performance Benchmarks
```typescript
// scripts/benchmarkSearch.ts
async function benchmarkSearch() {
  const socketId = '2491';
  const jewelType = jewelTypes.find(j => j.name === 'vaal')!;

  console.time('Load split jewel data');
  await loadJewel(jewelType.name, socketId);
  console.timeEnd('Load split jewel data');

  console.time('Search all seeds');
  // Perform full search
  console.timeEnd('Search all seeds');

  // Expected: Load < 100ms, Search < 500ms
}
```

## Performance Expectations

### Load Time
- **Before**: 31MB file → ~2-3 seconds to decompress and parse
- **After**: 1.5MB file → ~100-200ms to decompress and parse
- **Improvement**: 90-95% reduction

### Search Time
- **Before**: 5 seconds (7,901 seeds × 1,239 nodes = ~9.8M node checks)
- **After**: 250-500ms (7,901 seeds × 67 nodes = ~530K node checks)
- **Improvement**: 10-20x faster

### Memory Usage
- **Before**: ~31MB in memory (GloriousVanity) + parsed data overhead
- **After**: ~1.5MB in memory per loaded socket
- **Improvement**: 95% reduction

### Total Transfer
- **Before**: 31MB download for GloriousVanity
- **After**: 1.5MB download for specific socket
- **Improvement**: 95% less bandwidth

## Rollback Plan

If issues arise:

1. Keep original files in `src/data/jewels/legacy/`
2. Revert changes to `jewels.ts` by restoring original `loadJewel` function
3. Revert changes to `searchUtils.ts` and `searchLogic.ts`
4. Switch between old/new implementation by changing file path

## Advantages

1. **Simple Implementation**: No algorithm changes, just data restructuring
2. **Consistent with Current Architecture**: Follows existing patterns
3. **Immediate Performance Improvement**: 10-20x faster search
4. **Reduced Memory Usage**: 95% less memory
5. **Reduced Bandwidth**: 95% less data transferred
6. **Easy to Test**: Compare results before/after
7. **Safe Rollback**: Can revert to original files easily

## Disadvantages

1. **105 Files to Manage**: More complex file structure
2. **One-Time Pre-processing**: Need to run split script
3. **Still Loads All Seeds**: Iterates through all 7,901 seeds (just less data per seed)
4. **Build Complexity**: Need to manage split files in build process

## Future Enhancements

1. **Lazy Loading**: Only load jewel data when socket is selected
2. **Parallel Processing**: Process multiple jewel types in parallel during pre-processing
3. **Compression Optimization**: Try different compression levels for smaller files
4. **Streaming**: Stream data during search instead of loading all at once

## Conclusion

Plan A provides a straightforward, low-risk optimization that should reduce search time from 5 seconds to ~500ms with minimal code changes. The approach is consistent with the current architecture and allows for easy rollback if issues arise.
