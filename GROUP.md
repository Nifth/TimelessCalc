Plan: Refactor SeedSearch Results to Group by Stat Only
 Problem Statement
In SeedSearch results, stats are currently grouped by their full formatted string (e.g., "+10 to Strength" and "+5 to Strength" appear as separate entries). This makes it difficult to see the total values for each stat type.
 Desired Behavior
- Stats should be grouped by `statKey` only (similar to StatsResults component)
- Display both count and total value for each stat
- Show total at the end of each line, formatted with the appropriate divider
 Current Behavior Analysis
 Current Implementation (`src/ui/search/SeedSearch.svelte`)
**`getTimelessStats()` function (lines 19-35):**
- Returns `Record<string, number>` where key is the full stat string
- Groups by `node.timelessStats` (formatted string array)
- Only tracks occurrence count
**`highlightNodesWithStat()` function (lines 37-55):**
- Accepts `stat: string` parameter
- Checks `node.timelessStats?.includes(stat)`
- Uses full string for matching
**UI Display (lines 89-104):**
- Iterates over `Object.entries(timelessStats)`
- Shows: `({count}) {stat_string}`
 Proposed Solution
 File to Modify
`src/ui/search/SeedSearch.svelte` - All changes contained in this single file
 Change 1: Add Import
Add at top of script section:
import { translations } from "$lib/providers/translations";
Change 2: Refactor getTimelessStats() Function
Location: Lines 19-35
New Return Type:
Record<number, { count: number; total: number }>
New Implementation:
```js
function getTimelessStats(): Record<number, { count: number; total: number }> {
  const chosenSocket = $treeStore.chosenSocket;
  if (!chosenSocket) return {};
  const statData: Record<number, { count: number; total: number }> = {};
  for (const node of $treeStore.allocated.values()) {
    if (node?.timelessStatKeys && node?.timelessStatValues) {
      for (let i = 0; i < node.timelessStatKeys.length; i++) {
        const statKey = node.timelessStatKeys[i];
        const value = node.timelessStatValues[i];
        
        // Skip if the node already has this stat (same logic as before)
        const statEntry = translations[statKey.toString()]?.[0];
        if (statEntry && node.stats) {
          const statLabel = formatStatTranslation(statKey, value, translations);
          if (node.stats.includes(statLabel)) continue;
        }
        
        if (!statData[statKey]) {
          statData[statKey] = { count: 0, total: 0 };
        }
        statData[statKey].count++;
        statData[statKey].total += value;
      }
    }
  }
  return statData;
}
```
Helper Function Needed:
Import formatStatTranslation from $lib/utils/sidebar/sidebarUtils
Change 3: Refactor highlightNodesWithStat() Function
Location: Lines 37-55
New Signature:
function highlightNodesWithStat(statKey: number)
New Implementation:
```js
function highlightNodesWithStat(statKey: number) {
  canvas.highlightLayer?.destroyChildren();
  for (const node of $treeStore.allocated.values()) {
    // Skip nodes that already have this stat (same logic as before)
    if (node?.timelessStatKeys?.includes(statKey) && 
        !node.stats?.includes(/* formatted stat label */)) {
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
```
Note: The node.stats check may need adjustment to work with statKeys instead of formatted strings.
Change 4: Update UI Display Section
Location: Lines 89-104
New Implementation:
```js
{#if $searchStore.seedSearched && Object.keys(timelessStats).length > 0}
  <div class="bg-slate-800 rounded-lg p-4">
    <h4 class="text-sm font-semibold text-white mb-3">Current Stats</h4>
    <div class="space-y-2">
      {#each Object.entries(timelessStats) as [statKeyStr, data] (statKeyStr)}
        {@const statKey = parseInt(statKeyStr)}
        {@const transEntry = translations[statKeyStr]?.[0]}
        {@const divider = transEntry?.divider ?? 1}
        {@const displayTotal = data.total / divider}
        {@const color = $searchStore.statKeyColors[statKey] || '#10B981'}
        
        <button
          class="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-700 rounded cursor-pointer transition-all duration-200 text-sm"
          style="color: {color}"
          onclick={() => highlightNodesWithStat(statKey)}
        >
          <span>({data.count})</span>
          {transEntry?.translation || statKey}
          <span class="font-semibold"> total: [{displayTotal}]</span>
        </button>
      {/each}
    </div>
  </div>
{/if}
```
Change 5: Update Derived Computed Value
Location: Lines 70-72
No changes needed - the derived value will automatically use the new return type.
Implementation Notes
1. Import Required: Add import { formatStatTranslation } from "$lib/utils/sidebar/sidebarUtils";
2. Color Mapping: The implementation uses $searchStore.statKeyColors for consistent coloring. If a statKey doesn't have a color, it defaults to #10B981 (green).
3. Divider Logic: The translation's divider property is used to format the total value (e.g., divide by 1 for absolute values, by 10 for percentages).
4. Backward Compatibility: All changes are contained within the component. The API (props) remains unchanged.
5. Type Safety: All new code is properly typed with TypeScript.
Testing Checklist
After implementation:
- [ ] Perform a seed search and verify stats are grouped by stat type only
- [ ] Verify the total values are displayed correctly
- [ ] Verify the divider is applied correctly (percentages divided by 10, etc.)
- [ ] Click on a stat to ensure highlighting still works
- [ ] Check that stats with the same key but different values are merged with summed totals
- [ ] Verify color consistency between SeedSearch and StatsResults
- [ ] Run type checking: npm run check
- [ ] Run linting: npx eslint src/ui/search/SeedSearch.svelte
Alternative Approaches Considered
1. Group at Store Level: Could group stats in the search logic before storing. Rejected because it would affect other parts of the codebase and is overkill for this UI-only change.
2. Use Existing StatsResults Component: Could try to reuse StatsResults for seed results. Rejected because the data structures and use cases are different (single seed vs. search results).
Risks and Mitigations
1. Risk: The node.stats check in highlightNodesWithStat() may not work correctly with statKeys.
   - Mitigation: Test thoroughly; may need to convert statKey to formatted string for comparison.
2. Risk: Color mapping may not work for all stats.
   - Mitigation: Default color provided as fallback.
3. Risk: Missing translations for some statKeys.
   - Mitigation: Fallback to display the statKey number if translation is missing.