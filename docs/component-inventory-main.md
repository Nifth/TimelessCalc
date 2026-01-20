# UI Component Inventory - Main

## Component Categories

### Layout Components
- **Sidebar.svelte**: Main sidebar container
- **SidebarToggle.svelte**: Toggle sidebar visibility
- **SidebarHeader.svelte**: Sidebar header section
- **Modal.svelte**: Modal dialog component

### Form/Input Components
- **PlatformSelector.svelte**: Platform selection dropdown
- **LeagueSelector.svelte**: League selection dropdown
- **ModeSelector.svelte**: Mode selection component
- **ConquerorSelector.svelte**: Conqueror selection dropdown
- **JewelTypeSelector.svelte**: Jewel type selection dropdown
- **NodeToggles.svelte**: Node toggle controls
- **StatsSearch.svelte**: Stats search interface
- **SeedSearch.svelte**: Seed search & results interface

### Display Components
- **StatsResults.svelte**: Display stat calculation results
- **Tooltip.svelte**: Tooltip component
- **TradeNotification.svelte**: Trade-related notifications

### Navigation Components
- **BackButton.svelte**: Navigation back button

### Interactive Components
- **TradeControls.svelte**: Trade query controls

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