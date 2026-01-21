# TimelessCalc Refactoring Tasks

This directory contains individual refactoring tasks to address code duplication in the TimelessCalc project. Each task is designed to be completed independently.

## Task List

### 1. [Dropdown Component](./001-dropdown-component.md)
**Priority:** High
**Impact:** Removes ~100 lines of duplication
- Create generic Dropdown component
- Refactor LeagueSelector and PlatformSelector
- Improve maintainability of UI components

### 2. [Store Factory](./002-store-factory.md)
**Priority:** High
**Impact:** Removes ~40 lines of duplication
- Create factory for localStorage-based stores
- Refactor favoritesStore and historyStore
- Standardize store patterns

### 3. [Translation Provider](./003-translation-provider.md)
**Priority:** High
**Impact:** Removes ~30 lines of duplication across 4 files
- Centralize translation loading
- Eliminates JSON parsing duplication
- Improves performance (single parse)

### 4. [Entry Loading Logic](./004-entry-loading-logic.md)
**Priority:** Medium
**Impact:** Removes ~100 lines of duplication
- Consolidate favorite and history loading
- Extract common loading patterns
- Improve code reusability

### 5. [Formatting Utilities](./005-formatting-utilities.md)
**Priority:** Low
**Impact:** Removes ~60 lines of duplication
- Extract date and stats formatting
- Create keystone finding utility
- Standardize formatting across app

### 6. [Node Finding Logic](./006-node-finding-logic.md)
**Priority:** Medium
**Impact:** Removes ~15 lines of duplication
- Consolidate node by skill ID lookup
- Create utility functions for node operations
- Improve error handling

### 7. [Jewel Highlight Sprites](./007-jewel-highlight-sprites.md)
**Priority:** Low
**Impact:** Reduces duplication, improves maintainability
- Refactor showActive/showInactive functions
- Extract common sprite creation logic
- Make code more DRY

### 8. [Search Store Reset](./008-search-store-reset.md)
**Priority:** Medium
**Impact:** Removes ~25 lines of duplication
- Centralize search store reset logic
- Create specific reset functions
- Consistent state management

### 9. [Jewel Data Loading](./009-jewel-data-loading.md)
**Priority:** Low
**Impact:** Removes ~10 lines of duplication
- Consolidate data loading functions
- Improve error handling
- Single source of truth

### 10. [Socket Validation](./010-socket-validation.md)
**Priority:** Medium
**Impact:** Removes ~15 lines of duplication
- Create centralized socket validation
- Standardize error messages
- Improve user experience

### 11. [Socket Node Processing](./011-socket-node-processing.md)
**Priority:** Medium
**Impact:** Removes ~25 lines of duplication
- Consolidate socket node encoding/decoding
- Improve URL sharing efficiency
- Standardize node reconstruction

## Recommended Order

Start with high-priority tasks that have the greatest impact:

1. **Task 1: Dropdown Component** - Quick win, clear duplication
2. **Task 3: Translation Provider** - Performance improvement
3. **Task 2: Store Factory** - Architectural improvement
4. **Task 4: Entry Loading Logic** - Significant code reduction
5. **Task 8: Search Store Reset** - State management consistency

Then tackle medium-priority tasks:

6. **Task 6: Node Finding Logic** - Better error handling
7. **Task 10: Socket Validation** - Consistent validation
8. **Task 11: Socket Node Processing** - Better URL sharing
9. **Task 5: Formatting Utilities** - Code organization

Finally, address low-priority tasks:

10. **Task 7: Jewel Highlight Sprites** - Code quality
11. **Task 9: Jewel Data Loading** - Minor cleanup

## Total Impact

**Code Reduction:** ~420 lines of duplicated code
**Files Affected:** ~27 files
**New Files Created:** ~11 utility/abstraction files

## Notes

- Each task can be completed independently
- Tasks include verification checklists
- Breaking changes are minimal
- All tasks maintain backward compatibility
- Some tasks create dependencies (e.g., Task 4 uses utilities from Task 3)
- Run full test suite after each task completion

## Progress Tracking

- [x] Task 1: Dropdown Component ✅
- [x] Task 2: Store Factory ✅
- [ ] Task 3: Translation Provider
- [ ] Task 4: Entry Loading Logic
- [ ] Task 5: Formatting Utilities
- [ ] Task 6: Node Finding Logic
- [ ] Task 7: Jewel Highlight Sprites
- [ ] Task 8: Search Store Reset
- [ ] Task 9: Jewel Data Loading
- [ ] Task 10: Socket Validation
- [ ] Task 11: Socket Node Processing

---

**Generated:** January 21, 2026
**Review Status:** Pending approval
