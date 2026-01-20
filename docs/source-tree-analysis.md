# Source Tree Analysis - Main

## Directory Structure

```
src/
├── Tree.svelte              # Main application component
├── app.css                 # Global styles
├── main.ts                 # Application entry point
├── types.ts                # TypeScript type definitions
├── constants/
│   ├── tree.ts             # Tree-related constants
│   └── timeless.ts         # Timeless jewel constants
├── data/
│   ├── tree.json           # Passive skill tree data
│   ├── translation.json    # Stat translations
│   ├── jewelstats.json     # Jewel stat definitions
│   └── jewels/             # Compressed jewel data files
│       ├── ElegantHubris.jsonl.gz
│       ├── MilitantFaith.jsonl.gz
│       ├── BrutalRestraint.jsonl.gz
│       ├── LethalPride.jsonl.gz
│       └── GloriousVanity.jsonl.gz
├── konva/
│   ├── canvasContext.ts    # Canvas context management
│   ├── layers/
│   │   ├── background.ts   # Background layer
│   │   ├── lines.ts        # Connection lines layer
│   │   ├── nodes.ts        # Node rendering layer
│   │   └── hit.ts          # Hit detection layer
│   └── utils/
│       ├── click.ts        # Click handling
│       ├── hover.ts        # Hover effects
│       ├── nodes.ts        # Node utilities
│       ├── sprites.ts      # Sprite management
│       ├── jewelHighlight.ts # Jewel highlighting
│       └── zoom.ts         # Zoom functionality
├── providers/
│   ├── jewels.ts           # Jewel data provider
│   └── leagues.ts          # League data provider
├── stores/
│   ├── searchStore.ts      # Search state management
│   ├── treeStore.ts        # Tree state management
│   └── mouseStore.ts       # Mouse interaction state
├── ui/                    # UI components (organized by feature)
│   ├── common/              # Shared/reusable components
│   │   ├── Modal.svelte
│   │   ├── Tooltip.svelte
│   │   ├── Preloader.svelte
│   │   └── SidebarToggle.svelte
│   ├── search/              # Search-related components
│   │   ├── SearchForm.svelte
│   │   ├── SearchResults.svelte
│   │   ├── StatsResults.svelte
│   │   ├── SearchTab.svelte
│   │   ├── SeedSearch.svelte
│   │   ├── StatsSearch.svelte
│   │   └── SearchHistory.svelte
│   ├── selectors/           # Form control selectors
│   │   ├── JewelTypeSelector.svelte
│   │   ├── ConquerorSelector.svelte
│   │   ├── PlatformSelector.svelte
│   │   ├── LeagueSelector.svelte
│   │   └── ModeSelector.svelte
│   ├── modals/              # Modal dialogs
│   │   ├── SaveFavoriteModal.svelte
│   │   └── JewelLoadErrorModal.svelte
│   ├── notifications/       # Notification components
│   │   ├── ShareNotification.svelte
│   │   ├── FavoriteNotification.svelte
│   │   └── TradeNotification.svelte
│   ├── favorites/           # Favorites feature
│   │   └── Favorites.svelte
│   ├── sidebar/             # Sidebar layout
│   │   └── Sidebar.svelte
│   └── debug/               # Debug/development tools
│       ├── DebugPanel.svelte
│       ├── TradeControls.svelte
│       └── NodeToggles.svelte
└── utils/
    └── sidebar/
        ├── options.ts
        ├── searchLogic.ts
        ├── sidebarUtils.ts
        └── tradeQuery.ts
```

## Critical Folders Explained

### src/
**Purpose**: Main source directory containing all application code

**Entry Points**:
- `main.ts`: Application bootstrap and mounting

**Key Components**:
- `Tree.svelte`: Root component for passive tree visualization

### konva/
**Purpose**: Canvas rendering logic using Konva.js

**Layers**:
- `layers/background.ts`: Static background rendering
- `layers/lines.ts`: Connection lines between nodes
- `layers/nodes.ts`: Individual node rendering
- `layers/hit.ts`: Mouse interaction hit detection

**Utilities**:
- Click, hover, zoom, and sprite management functions

### stores/
**Purpose**: Svelte stores for state management

**Stores**:
- `searchStore.ts`: Search parameters and results
- `treeStore.ts`: Tree interaction state
- `mouseStore.ts`: Mouse position and interaction

### ui/
**Purpose**: Reusable UI components organized by feature

**Subfolders**:
- `common/`: Shared components used across features
- `search/`: All search-related components and interfaces
- `selectors/`: Form control dropdowns and selectors
- `modals/`: Modal dialog components
- `notifications/`: Notification and alert components
- `favorites/`: Favorites feature components
- `sidebar/`: Sidebar layout and navigation
- `debug/`: Development and debugging tools

### providers/
**Purpose**: Data loading and API integration

**Providers**:
- `jewels.ts`: Loads and caches jewel data
- `leagues.ts`: Fetches league information

### data/
**Purpose**: Static data files

**Contents**:
- Tree structure and constants
- Precomputed jewel statistics
- Translation mappings

## Architecture Notes

- **Frontend-Only**: No backend server, all data loaded client-side
- **Canvas-Based**: Uses Konva.js for interactive tree visualization
- **Reactive**: Svelte's reactivity system drives UI updates
- **Modular**: Clear separation of concerns across directories

## Integration Points

- **Data Flow**: providers → stores → components → canvas
- **User Interaction**: UI components → stores → canvas updates
- **External APIs**: Limited to PoE Watch for league data

## No Multi-Part Architecture

This is a monolithic frontend application with no separate client/server components or microservices.