# Source Tree Analysis - Main

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
