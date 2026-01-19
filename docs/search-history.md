# Search History

The search history feature automatically saves and restores previous search configurations, allowing users to quickly revisit and reload past searches.

## Overview

Search history stores complete search configurations including jewel type, conqueror, selected stats, allocated nodes, and socket selection. Each entry is saved with a timestamp and can be reloaded at any time.

## Features

### Automatic Saving

Searches are saved automatically when a search is performed. Each entry captures:
- **Socket**: The passive tree socket location
- **Jewel Type**: Selected jewel (Glorious Vanity, Lethal Pride, etc.)
- **Conqueror**: Selected conqueror modifier
- **Stats**: Selected stat filters with weights
- **Min Total Weight**: Minimum weight threshold
- **Allocated Nodes**: List of allocated passive skill nodes
- **Timestamp**: When the search was performed

### History Limits

- Maximum of 10 entries stored in localStorage
- Oldest entries are automatically removed when limit is exceeded
- History persists across browser sessions

### Loading History

1. Click the **Load** button on any history entry
2. If current configuration exists, a confirmation dialog appears
3. Once confirmed, the application:
   - Restores the socket location
   - Reallocates saved passive nodes
   - Applies the saved jewel type and conqueror
   - Executes the search automatically
   - Centers the canvas on the socket

### Managing History

- **Delete Entry**: Click the trash icon to remove a specific entry
- **Clear All**: Available via history actions (future feature)

## Technical Details

### Storage

History is stored in browser localStorage under the key `timelessCalc_searchHistory`.

### Data Structure

```typescript
interface SearchHistoryEntry {
  id: string;              // UUID
  timestamp: number;       // Unix timestamp
  socket: Node;            // Socket configuration
  jewelType: JewelType;    // Selected jewel type
  conqueror: Conqueror;    // Selected conqueror
  stats: Stat[];           // Selected stats with weights
  minTotalWeight: number;  // Minimum weight threshold
  allocatedSkillIds: string[];  // Allocated node IDs
}
```

### Store Methods

The `historyStore` provides the following actions via `historyActions`:

| Method | Description |
|--------|-------------|
| `saveCurrentSearch()` | Saves current search configuration |
| `loadSearch(entry)` | Restores a history entry |
| `deleteEntry(id)` | Removes a specific entry |
| `clearHistory()` | Clears all history |

## Files

- `src/stores/historyStore.ts` - History state management
- `src/ui/SearchHistory.svelte` - History UI component
