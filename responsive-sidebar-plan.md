# Responsive Sidebar Implementation Plan

## Overview
Make the TimelessCalc sidebar responsive while preserving desktop functionality. The sidebar contains search, favorites, and history functionality.

## Current Implementation
- Fixed 650px width sidebar overlaying full-viewport canvas
- Toggle button at top-left corner
- Starts open by default
- Contains three tabs: Search, Favorites, History

## Proposed Changes

### 1. Responsive Width
- **Mobile (< 768px)**: Full width (`w-full`)
- **Desktop (≥ 768px)**: Fixed 650px width (`md:w-[650px]`)

### 2. Initial State
- **Mobile**: Starts closed (user must toggle to open)
- **Desktop**: Starts open (current behavior)

### 3. Toggle Button Positioning
- **Mobile**: Closer to screen edge (`left-2`) for thumb accessibility
- **Desktop**: Standard position (`left-4`)

### 4. Behavior
- No auto-closing on mobile - user manually controls open/close
- Maintains overlay behavior on all screen sizes

## Implementation Steps

### Sidebar.svelte Updates
```typescript
// Change initial state
let isOpen = $state(typeof window !== 'undefined' && window.innerWidth >= 768);

// Update width class
class="fixed left-0 top-0 h-screen w-full md:w-[650px] bg-slate-900/80 backdrop-blur-sm p-6 overflow-y-auto shadow-2xl z-40 transition-all duration-300 ease-out border-r border-slate-700 custom-scrollbar"
```

### SidebarToggle.svelte Updates
```typescript
// Update positioning
class="fixed top-4 left-2 md:left-4 z-50 bg-slate-800 hover:bg-slate-700 text-white w-10 h-10 rounded-lg flex flex-col justify-center items-center gap-1 cursor-pointer transition-all duration-200 shadow-lg border border-slate-600"
```

## Testing Considerations
- Verify sidebar opens/closes correctly on mobile
- Check toggle button accessibility on small screens
- Ensure content remains readable at full width
- Confirm desktop behavior unchanged
- Test tooltip positioning bounds on mobile

## Files to Modify
- `src/ui/sidebar/Sidebar.svelte`
- `src/ui/common/SidebarToggle.svelte`