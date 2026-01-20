# UI Component Inventory - Main

## Component Categories

### common/ - Shared Components
- **Modal.svelte**: Modal dialog component
- **Tooltip.svelte**: Tooltip component
- **Preloader.svelte**: Loading progress indicator
- **SidebarToggle.svelte**: Toggle sidebar visibility

### search/ - Search Components
- **SearchTab.svelte**: Container switching between search form and results
- **SearchForm.svelte**: Search configuration form
- **SearchResults.svelte**: Search results display and actions
- **SearchHistory.svelte**: Search history management
- **StatsResults.svelte**: Display stat calculation results
- **StatsSearch.svelte**: Stats search interface
- **SeedSearch.svelte**: Seed search & results interface

### selectors/ - Form Controls
- **JewelTypeSelector.svelte**: Jewel type selection dropdown
- **ConquerorSelector.svelte**: Conqueror selection dropdown
- **PlatformSelector.svelte**: Platform selection dropdown
- **LeagueSelector.svelte**: League selection dropdown
- **ModeSelector.svelte**: Mode selection component

### modals/ - Modal Dialogs
- **SaveFavoriteModal.svelte**: Save to favorites dialog
- **JewelLoadErrorModal.svelte**: Jewel data loading error dialog

### notifications/ - Notifications
- **ShareNotification.svelte**: Share URL notifications
- **FavoriteNotification.svelte**: Favorites action notifications
- **TradeNotification.svelte**: Trade-related notifications

### favorites/ - Favorites Feature
- **Favorites.svelte**: Favorites management interface

### sidebar/ - Sidebar Layout
- **Sidebar.svelte**: Tab container for search interface

### debug/ - Development Tools
- **DebugPanel.svelte**: Development debug panel
- **TradeControls.svelte**: Trade query controls
- **NodeToggles.svelte**: Node toggle controls

## Design System

### Styling Approach
- **Framework**: Tailwind CSS for utility-first styling
- **Custom CSS**: app.css for global styles
- **Component Scoping**: Scoped styles in .svelte files

### Component Patterns
- **Reactive Props**: Components respond to prop changes
- **Event Dispatching**: Custom events for parent communication
- **Store Integration**: Direct integration with Svelte stores

### No Dedicated Component Library
The application uses custom components without external UI libraries, maintaining consistency through Tailwind CSS utilities.