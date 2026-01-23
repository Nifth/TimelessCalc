# TimelessCalc Documentation Index

## Getting Started

1. **Prerequisites**: Node.js and npm installed
2. **Installation**: Run `npm install` to install dependencies
3. **Development**: Run `npm run dev` to start the development server
4. **Build**: Run `npm run build` to create a production build
5. **Type Check**: Run `npm run check` to verify TypeScript types

The application provides an interactive interface for calculating and visualizing Path of Exile timeless jewel configurations using a canvas-based passive skill tree renderer.

## Features

### Passive Tree Visualization

- Interactive canvas rendering of the Path of Exile passive skill tree
- Support for timeless jewel configurations with conqueror modifiers
- Node allocation and deallocation with visual feedback
- Zoom and pan controls for navigation

### Search and Filtering

- Search by seed or by stats
- Search for optimal jewel configurations based on desired stats
- Filter by jewel type (Glorious Vanity, Lethal Pride, etc.)
- Select conqueror and specific stat requirements
- Real-time results with pagination and trade integration

### Search History

- Automatically saves previous search configurations
- Stores up to 10 entries in localStorage
- Each entry preserves jewel type, conqueror, stats, and allocated nodes
- Load previous searches with one click
- Confirmation dialog prevents accidental configuration loss

### Favorites

- Explicitly save and organize preferred search configurations
- User-defined names for easy identification
- Support for pinning frequently used favorites
- Stores up to 50 entries in localStorage
- Load favorites with one click to restore complete configuration

### Sharing Configurations

- Generate shareable URLs that encode current search filters and tree state
- Copy URL to clipboard for sharing configurations with others
- URL parameters include:
  - `jt`: Jewel type name
  - `c`: Conqueror label
  - `s`: Selected stats (JSON array)
  - `l`: League name
  - `p`: Platform (PC/Xbox/Playstation)
  - `so`: Socket skill ID
  - `a`/`un`: Allocated or unallocated node skills (JSON array)
  - `tw`: Min total weight field
