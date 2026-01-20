# Favorites

The favorites feature allows users to explicitly save and organize their most-used search configurations for quick access.

## Overview

Favorites are user-created bookmarks of search configurations. Unlike search history which records searches automatically, favorites require an explicit save action and support user-defined names for easy identification.

## Features

### Creating Favorites

Users can save the current search configuration as a favorite:

- **Save Button**: Available in search results or sidebar actions
- **Custom Name**: Users can optionally name each favorite
- **Automatic Naming**: If no name provided, uses jewel type + timestamp
- **Captured Data**:
  - Socket location
  - Jewel type and conqueror
  - Selected stats with weights
  - Minimum total weight
  - Allocated passive nodes

### Managing Favorites

| Action | Description |
|--------|-------------|
| **Load** | Applies favorite configuration and triggers search |
| **Edit Name** | Rename the favorite for easier identification |
| **Delete** | Removes the favorite permanently |
| **Pin** | Keeps frequently used favorites at the top |

### Favorites Limits

- Maximum of 50 favorites per user
- Oldest entries automatically removed when limit exceeded
- Favorites persist across browser sessions

### Loading Favorites

1. Click the **Load** button on any favorite entry
2. If unsaved changes exist, a confirmation dialog appears
3. Upon confirmation, the application:
   - Restores the socket location
   - Reallocates saved passive nodes
   - Applies the saved jewel type and conqueror
   - Executes the search automatically
   - Centers the canvas on the socket

## Technical Details

### Storage

Favorites are stored in browser localStorage under the key `timelessCalc_favorites`.

### Data Structure

```typescript
interface Favorite {
  id: string;                    // UUID
  name: string;                  // User-defined name
  createdAt: number;             // Unix timestamp
  lastUsed: number;              // Last load timestamp
  isPinned: boolean;             // Pin status for sorting
  socket: Node;                  // Socket configuration
  jewelType: JewelType;          // Selected jewel type
  conqueror: Conqueror;          // Selected conqueror
  stats: Stat[];                 // Selected stats with weights
  minTotalWeight: number;        // Minimum weight threshold
  allocatedSkillIds: string[];   // Allocated node IDs
}
```

### Store Methods

The `favoritesStore` provides the following actions via `favoritesActions`:

| Method | Description |
|--------|-------------|
| `saveFavorite(name?)` | Saves current search configuration |
| `loadFavorite(id)` | Restores a favorite entry |
| `deleteFavorite(id)` | Removes a specific favorite |
| `renameFavorite(id, name)` | Updates favorite name |
| `togglePin(id)` | Toggles pin status |
| `reorderFavorites(orders)` | Reorders favorites manually |

### Comparison with Search History

| Aspect | Favorites | Search History |
|--------|-----------|----------------|
| **Saving** | Manual (user action) | Automatic |
| **Naming** | User-defined | Auto-generated |
| **Retention** | Permanent until deleted | Limited to 10 entries |
| **Purpose** | Quick access to best configs | Revisit recent searches |
| **Sorting** | Supports pinning | By timestamp only |

## Files

- `src/stores/favoritesStore.ts` - Favorites state management
- `src/ui/FavoritesPanel.svelte` - Favorites UI component
- `src/utils/favoritesActions.ts` - CRUD operations for favorites
