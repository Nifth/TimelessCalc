# Task: Create Store Factory for localStorage Persistence

## Files to Create

### 1. `src/stores/utils/storeFactory.ts`
**Purpose:** Factory function to create consistent store patterns for favorites and history

**Current Duplicated Code:**
- `src/stores/favoritesStore.ts` (lines 1-60) - Store setup, CRUD operations
- `src/stores/historyStore.ts` (lines 1-51) - Store setup, CRUD operations

**Implementation:**
```typescript
interface StoreFactoryConfig<T, TAction> {
  storageKey: string;
  actions: TAction;
}

function createPersistedStore<T extends BaseEntry>(config: StoreFactoryConfig<T, any>);
```

**Features to Include:**
- Automatic localStorage loading on initialization
- Automatic localStorage saving on updates
- Standard CRUD operations (create, read, update, delete)
- `hasCurrentConfiguration()` helper
- `exists()` helper

## Files to Modify

### 2. `src/stores/favoritesStore.ts`
**Changes:**
- Refactor to use storeFactory
- Keep only favorites-specific actions (updateName)
- Keep name parameter in BaseEntry extension

**Before:**
```typescript
// 60 lines with localStorage logic, subscriptions, CRUD operations
```

**After:**
```typescript
// ~30 lines using factory + favorites-specific methods
```

### 3. `src/stores/historyStore.ts`
**Changes:**
- Refactor to use storeFactory
- Keep only history-specific actions (clearHistory)
- Remove duplicated localStorage logic

**Before:**
```typescript
// 51 lines with localStorage logic, subscriptions, CRUD operations
```

**After:**
```typescript
// ~20 lines using factory + history-specific methods
```

### 4. `src/stores/utils/storeUtils.ts`
**Changes:**
- Mark createLocalStorageManager as deprecated after migration
- Keep createBaseEntry() and loadConfiguration() (used by store factory)
- Update imports to point to storeFactory

## Verification Checklist
- [ ] Favorites loads from localStorage correctly
- [ ] Favorites saves to localStorage correctly
- [ ] History loads from localStorage correctly
- [ ] History saves to localStorage correctly
- [ ] All favorites CRUD operations work
- [ ] All history CRUD operations work
- [ ] `hasCurrentConfiguration()` works for both
- [ ] `exists()` works for favorites
- [ ] `clearHistory()` still works
- [ ] `updateName()` still works
- [ ] No regression in functionality
- [ ] Code reduction: Remove ~40 lines of duplicated code
