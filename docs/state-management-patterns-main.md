# State Management Patterns - Main

## Svelte Stores

The application uses Svelte's built-in store system for state management.

### searchStore.ts
- **Type**: Writable<SearchStore>
- **Purpose**: Manages search parameters and results for timeless jewel calculations
- **Key Features**:
  - Jewel type, conqueror, seed selection
  - Stat filtering and results
  - Pagination for trade queries
  - League and platform selection

### treeStore.ts
- **Type**: Writable store
- **Purpose**: Manages passive skill tree state and interactions

### mouseStore.ts
- **Type**: Writable store
- **Purpose**: Tracks mouse interactions with the canvas

### Jewel Loading Stores
- **loadingJewels**: Writable<Set<string>> - Tracks currently loading jewel types
- **loadedJewels**: Writable<Set<string>> - Tracks loaded jewel types

## State Update Patterns

- **Immutability**: State updates create new objects rather than mutating existing ones
- **Reactive**: Components automatically re-render when stores change
- **Centralized**: All state is managed through dedicated store files

## No Complex State Management Libraries

The application uses simple Svelte stores without Redux, MobX, or other state management libraries, keeping the architecture simple and reactive.