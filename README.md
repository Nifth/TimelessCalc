# TimelessCalc

Interactive Path of Exile Timeless Jewel Calculator - calculate and visualize optimal passive tree jewel configurations.

## Features

- **Passive Tree Visualization**: Interactive canvas rendering of the Path of Exile passive skill tree
- **Timeless Jewel Configuration**: Support for all timeless jewel types (Glorious Vanity, Lethal Pride, Brutal Restraint, Militant Faith, Elegant Hubris)
- **Search by Seed**: Visualize specific timeless jewel seed configurations
- **Search by Stats**: Find optimal jewels based on desired stat modifiers
- **Trade Integration**: Generate PoE trade links for found jewel seeds
- **Search History**: Automatically saves your recent searches
- **Favorites**: Save and organize your preferred configurations
- **Share URLs**: Share configurations with others via URL

## Getting Started

### Prerequisites

- Node.js (18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run check
```

## Project Structure

```
src/
├── main.ts              # Application entry point
├── Tree.svelte          # Main application component
├── types.ts             # TypeScript type definitions
├── konva/               # Canvas rendering logic
│   ├── canvasContext.ts  # Canvas context management
│   ├── layers/          # Konva layer implementations
│   └── utils/           # Canvas utilities
├── stores/              # Svelte stores
├── ui/                  # UI components
├── providers/           # Data providers
├── constants/           # Application constants
└── utils/               # Utility functions
```

## Documentation

For detailed documentation, see [docs/index.md](docs/index.md)

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)

## License

MIT

