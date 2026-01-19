# Favorites Tab Feature Plan

## Overview
Add a Favorites feature allowing users to save search configurations with custom names for quick access later.

## Data Model

### Type Definition (`src/types.ts`)

```typescript
export interface FavoriteEntry extends SearchHistoryEntry {
  name: string;
}
```

Extends `SearchHistoryEntry` with a `name` field for user-provided favorite names.

## Name Suggestion Algorithm

**Pattern**: `"${conqueror.label} (${jewelType.label}) - ${keystone}"`

**Examples**:
- `Kaom (Lethal Pride) - Strength of Blood`
- `Avarius (Militant Faith) - Power of Purpose`
- `Any (Glorious Vanity) - Any`

**Fallback**: If any value is missing, use `"Unnamed Favorite - [timestamp]"`

## UI Flow

1. User performs a stats search with results displayed
2. Clicks "Save to Favorites" button (next to "Share Configuration")
3. Modal opens with pre-filled name input, input pre-focused
4. User edits/accepts name → clicks Save
5. Toast notification appears: "Saved as '{favorite name}'"
6. Favorites tab lists the entry with load/delete/edit actions

## Components

### 1. Favorites Store (`src/stores/favoritesStore.ts`)

**Features**:
- localStorage-backed persistence (key: `timelessCalc_favorites`)
- No entry limit (unlike history's 10-entry cap)
- Reuses `historyStore` logic for loading configurations

**Actions**:
| Method | Description |
|--------|-------------|
| `saveFavorite(name: string)` | Saves current search with provided name |
| `updateName(id: string, newName: string)` | Updates favorite name inline |
| `loadFavorite(entry: FavoriteEntry)` | Loads configuration (reuses history logic) |
| `deleteFavorite(id: string)` | Removes entry from favorites |
| `hasCurrentConfiguration(): boolean` | Checks if search has data to save |
| `exists(id: string): boolean` | Checks if favorite already exists |

**Duplicate Handling**: Allow duplicates. User manages naming.

### 2. Save Favorite Modal (`src/ui/SaveFavoriteModal.svelte`)

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `suggestedName` | `string` | Pre-filled value (suggested name) |
| `onSave` | `(name: string) => void` | Callback when saving |
| `onCancel` | `() => void` | Callback when cancelling |

**Behavior**:
- Modal backdrop with blur
- Input element pre-focused on mount
- Enter key submits, Escape cancels
- Click outside or Cancel button closes without saving
- Placeholder shows suggested name

### 3. Favorite Notification (`src/ui/FavoriteNotification.svelte`)

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Name of the saved favorite |
| `onDismiss` | `() => void` | Callback when dismissing |

**Behavior**:
- Toast notification positioned bottom-right
- Auto-dismisses after 3 seconds
- Manual dismiss via close button
- Animation: slide in from right, fade out

**Style Reference**: Use `TradeNotification.svelte` as styling reference.

### 4. Favorites Tab UI (`src/ui/Favorites.svelte`)

**Props**:
```typescript
let { onswitchtotab }: { onswitchtotab: (tab: 'search' | 'favorites' | 'history') => void } = $props();
```

**Features**:
| Feature | Description |
|---------|-------------|
| Edit name | Pencil icon → inline input → Enter/Blur saves |
| Load | Same confirm modal as history if unsaved changes |
| Delete | Removes entry (no confirmation for simplicity) |
| Empty state | "No favorites yet. Save a search to see it here." |

**Card Layout**:
```
+--------------------------------------------------+
| [Name (editable)]                    [✏️][🗑️] |
| Conqueror (Jewel Type) - Keystone               |
| Stat1, Stat2 (+N more)                           |
| 5 allocated • Min weight: 100 • 2024-01-19      |
|                                   [Load]        |
+--------------------------------------------------+
```

**Inline Edit Behavior**:
- Click pencil icon → input field replaces name text
- Input auto-focused on edit mode
- Enter → saves, Escape → cancels
- Clicking outside input saves changes

## Integration Points

### Sidebar (`src/ui/Sidebar.svelte`)

**Add "Save to Favorites" button** (next to Share button, lines ~380-388):

**Visibility**: Shown when:
- `$searchStore.searched === true`
- `$searchStore.mode === "stats"`
- `$searchStore.statsSearched === true`
- `Object.keys($searchStore.statsResults).length > 0`

**State**:
```typescript
let showSaveFavoriteModal = $state(false);
let favoriteNameInput = $state("");
let favoriteSuggestion = $state("");
```

**Logic**:
1. Generate suggested name from current search state
2. Open modal on button click
3. Pass suggestion to modal
4. On save → call `favoritesStore.saveFavorite(name)` → show toast

**Favorites tab content**:
```svelte
{:else if activeTab === 'favorites'}
  <Favorites onswitchtotab={(tab) => activeTab = tab} />
{/if}
```

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/types.ts` | Modify | Add `FavoriteEntry` interface |
| `src/stores/favoritesStore.ts` | Create | Favorites persistence store |
| `src/ui/SaveFavoriteModal.svelte` | Create | Modal for naming favorites |
| `src/ui/FavoriteNotification.svelte` | Create | Toast feedback component |
| `src/ui/Favorites.svelte` | Create | Favorites list UI |
| `src/ui/Sidebar.svelte` | Modify | Add button, integrate components |

## Implementation Order

1. Add `FavoriteEntry` to `src/types.ts`
2. Create `src/stores/favoritesStore.ts`
3. Create `src/ui/SaveFavoriteModal.svelte`
4. Create `src/ui/FavoriteNotification.svelte`
5. Create `src/ui/Favorites.svelte`
6. Integrate in `src/ui/Sidebar.svelte`

## Design Notes

- Follow existing component patterns (Svelte 5 runes, Tailwind CSS)
- Use existing modal styling from `Modal.svelte`
- Use `TradeNotification.svelte` as toast styling reference
- Reuse `findNearbyKeystone()` from `SearchHistory.svelte`
- Reuse history loading logic from `historyActions.loadSearch()`
