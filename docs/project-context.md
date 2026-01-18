# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Frontend Framework:** Svelte 5.43.8
- **Language:** TypeScript ~5.9.3  
- **Canvas Library:** Konva ^10.0.12
- **Styling:** Tailwind CSS ^4.1.18
- **Build Tool:** Vite (rolldown-vite) 7.2.5
- **Linting:** ESLint 9.39.2
- **Formatting:** Prettier (via plugin)

## Critical Implementation Rules

### Language-Specific Rules

- Use TypeScript strict mode (noImplicitAny, strictNullChecks enabled)
- Import types with `import type` syntax for type-only imports
- Use async/await for all asynchronous operations
- Handle errors with try/catch blocks around async calls
- Use camelCase for variables and functions, PascalCase for types and components

### Framework-Specific Rules

- Use Svelte stores (writable, readable) for shared state management
- Reactive statements use `$:` syntax for automatic updates
- Component props are explicitly typed with TypeScript interfaces
- Event dispatchers (`createEventDispatcher`) for parent component communication
- Lifecycle functions (onMount, onDestroy) in <script> blocks
- Scoped styles in <style> tags to avoid global CSS conflicts
- Component composition over inheritance patterns

### Testing Rules

- Testing framework not currently configured in the project
- When implementing tests, use Vitest with jsdom for DOM testing
- Component tests should verify user interactions and reactive state changes
- Store tests should validate reactive updates and subscriptions
- Integration tests should cover provider and canvas interaction flows
- Test files should be co-located with components (*.test.ts)

### Code Quality & Style Rules

- All code must pass ESLint rules without warnings
- Prettier formatting applied to all TypeScript and Svelte files
- Import organization: external libraries first, then internal imports
- Use $lib alias for all src imports (configured in vite.config.ts)
- Type imports use `import type` syntax
- Use descriptive variable names in camelCase
- Component and type names in PascalCase
- File names in kebab-case for Svelte components
- All comments and documentation in English only

### Development Workflow Rules

- Use feature branches for development work, merging to main when complete
- Commit messages should be descriptive, in English, and follow conventional format
- Pull requests should include clear description of changes and testing done
- Run `npm run check` before committing to ensure TypeScript compilation and linting pass
- Static site deployment requires only `npm run build` output
- No complex deployment or server management required

### Critical Don't-Miss Rules

- Avoid direct DOM manipulation; always use Svelte's reactive system and stores
- Never block the main thread with synchronous operations on large datasets
- Always handle errors in async operations to prevent UI freezing
- Use compressed data files (.jsonl.gz) for performance; avoid loading large uncompressed data
- Don't store sensitive data in client-side state (frontend-only application)
- Avoid global CSS; use scoped styles in Svelte components
- Never use eval() or other unsafe JavaScript constructs
- Always validate external API responses before using in components
- Avoid circular dependencies between stores and components
