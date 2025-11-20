# Copilot Instructions for TimelessCalc

## Project Overview
TimelessCalc is a TypeScript/JavaScript project for analyzing Path of Exile's Timeless Jewels and skill tree. It consists of a data preprocessing pipeline and a frontend visualization/search tool. The codebase is organized for clarity and modularity, with a focus on static JSON data and UI logic.

## Architecture & Data Flow
- **data/**: Contains static JSON files for skill tree nodes, jewel effects, and mods. These are the main data sources for the frontend.
- **preprocessing/**: Node.js scripts (TypeScript) for generating and validating JSON data. Output is copied to `data/`.
- **src/** (frontend):
  - **main.ts**: Entry point. Loads JSON, initializes UI (Konva canvas), wires up components.
  - **components/**: Organized by feature (tree, search, ui). Each subfolder contains logic, types, and helpers for its domain.
  - **assets/**: CSS and images for UI.

## Developer Workflows
- **Build/Dev**: Use Vite for frontend (`vite.config.ts`).
  - `npm run dev` (in root) for local development.
  - `npm run build` for production build.
- **Preprocessing**: Run scripts in `preprocessing/` to update JSON data. Output is staged in `preprocessing/output/` before copying to `data/`.
- **TypeScript**: Both frontend and preprocessing use TypeScript. Configs are in their respective `tsconfig.json` files.

## Conventions & Patterns
- **No frameworks**: UI is custom, not React/Vue. Components are plain TypeScript modules.
- **Data contracts**: Types/interfaces for all major data structures are in `types.ts` files (see `src/components/tree/types.ts`, `preprocessing/src/types.ts`).
- **Helpers**: Utility functions are grouped in `utils.ts` per domain.
- **Separation of concerns**: Parsing, rendering, state management, and UI logic are kept in separate files.
- **Search logic**: Implemented in `src/components/search/searcher.ts` and `utils.ts`. UI in `ui.ts`.

## Integration Points
- **Konva**: Used for canvas rendering (skill tree visualization).
- **External data**: All game data is loaded from static JSON files. No backend/API calls.
- **Preprocessing dependencies**: Uses `axios` for fetching, `zod` for validation.

## Examples
- To add a new jewel type, update `data/jewels/` and extend types/interfaces in relevant `types.ts` files.
- To change search behavior, modify `src/components/search/searcher.ts` and update UI in `ui.ts`.

## Key Files
- `src/main.ts`: App entry, data loading, component wiring
- `src/components/tree/renderer.ts`: Skill tree rendering logic
- `src/components/search/searcher.ts`: Search logic
- `preprocessing/src/parseTree.ts`, `parseJewels.ts`: Data parsers
- `data/`: All static game data

---
For questions about unclear conventions or missing documentation, ask the user for clarification or examples from their workflow.