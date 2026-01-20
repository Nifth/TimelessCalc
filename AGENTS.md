# AGENTS.md

This file contains essential information for agentic coding agents working in the TimelessCalc repository.

## Project Overview

TimelessCalc is a Svelte + TypeScript application for calculating and visualizing Path of Exile passive tree jewel configurations. The app uses Vite for development and building, Konva.js for canvas rendering, and Svelte stores for state management.

## Development Commands

### Core Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run check` - Run type checking (svelte-check + TypeScript compiler)

### Linting and Formatting

- `npx eslint .` - Run ESLint on all files
- `npx eslint [filename]` - Run ESLint on specific file
- `npx prettier --write [filename]` - Format file with Prettier
- `npx prettier --write .` - Format all files

### Type Checking

- `npx svelte-check --tsconfig ./tsconfig.app.json` - Check Svelte components
- `npx tsc -p tsconfig.app.json` - TypeScript compiler check
- `npx tsc -p tsconfig.node.json` - Node TypeScript check

### Testing

No test framework is currently configured. Tests are not required for this project. To add testing in the future, consider installing Vitest and updating package.json with test scripts.

## Project Structure

```
src/
├── main.ts              # Application entry point
├── app.css              # Global styles
├── types.ts             # TypeScript type definitions
├── Tree.svelte          # Main application component
├── ui/                  # UI components (organized by feature)
│   ├── common/              # Shared/reusable components
│   ├── search/              # Search-related components
│   ├── selectors/           # Form control selectors
│   ├── modals/              # Modal dialogs
│   ├── notifications/       # Notification components
│   ├── favorites/           # Favorites feature
│   ├── sidebar/             # Sidebar layout
│   └── debug/               # Debug/development tools
├── stores/              # Svelte stores
│   ├── searchStore.ts   # Search state management
│   ├── treeStore.ts     # Tree state management
│   └── mouseStore.ts    # Mouse interaction state
├── utils/               # Utility functions
│   └── sidebar/         # Sidebar-specific utilities
├── konva/               # Canvas rendering logic
│   ├── canvasContext.ts # Canvas context management
│   ├── layers/          # Konva layer implementations
│   └── utils/           # Canvas utilities
├── constants/           # Application constants
├── providers/           # Data providers
└── data/                # Static JSON data files
```

## Code Style Guidelines

### Import Organization

- Use `$lib` alias for all src imports (configured in vite.config.ts)
- Group imports: external libraries first, then internal imports
- Type imports use `import type` syntax
- Example:

```ts
import Konva from "konva";
import type { Node, Group } from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
```

### TypeScript Conventions

- Use interfaces for object types, types for unions/primitives
- Explicitly type function parameters and return values
- Use `null` for intentionally absent values, not `undefined`
- Prefer `const` over `let` when possible
- Use descriptive variable names in camelCase

### Svelte Component Patterns

- Use `<script lang="ts">` for TypeScript support
- Reactive statements use `$:` prefix
- Store subscriptions use `$store` syntax
- Event handlers use `on:eventname` directive
- Component props should be explicitly typed

### File Naming

- Use PascalCase for components (`Sidebar.svelte`, `Tree.svelte`)
- Use camelCase for utilities and stores (`searchStore.ts`, `sidebarUtils.ts`)
- Use kebab-case for directories when needed (`ui/`, `utils/sidebar/`)

### State Management

- Use Svelte stores for shared state
- Store updates should be immutable
- Use `writable` for mutable stores, `readable` for computed values
- Store type definitions should be inline or exported from types.ts

### Canvas/Konva Patterns

- Canvas context managed in `konva/canvasContext.ts`
- Separate layers for different visual elements
- Use TypeScript for Konva configuration objects
- Clean up Konva objects when components destroy

### Error Handling

- Use try-catch blocks for async operations
- Provide meaningful error messages
- Consider user-friendly error display in UI
- Log errors appropriately for debugging

### CSS/Styling

- Use scoped styles in `<style>` blocks
- Follow BEM-like naming for CSS classes
- Use CSS custom properties for theming when applicable
- Responsive design considerations for mobile

### Code Comments

- Use comments for complex logic explanations
- Document public function purposes and parameters
- No inline comments for obvious code
- Use TODO/FIXME comments for temporary solutions
- ALL code and comments MUST be written in English only
- If any non-English text is found, it should be replaced with English

## Development Notes

### Dependencies

- Svelte 5.x with TypeScript support
- Vite (rolldown-vite variant) for bundling
- Konva.js for 2D canvas rendering

### Build Configuration

- Uses `$lib` alias pointing to `/src`
- TypeScript paths configured for clean imports
- ESLint with Svelte plugin for linting
- Prettier with Svelte plugin for formatting

### Data Handling

- Jewel data stored as compressed JSONL files
- Static data imported with `with { type: "json" }`
- Large datasets handled with streaming when possible
- Cache expensive computations in stores or variables

### Performance Considerations

- Use Svelte's reactivity efficiently
- Debounce expensive operations (search, canvas updates)
- Lazy load data when appropriate
- Optimize Konva rendering with layer batching
