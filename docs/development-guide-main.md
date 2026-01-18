# Development Guide - Main

## Prerequisites

- **Node.js**: Required for running the development server and build tools
- **npm**: Package manager (comes with Node.js)

## Installation

```bash
npm install
```

This installs all dependencies listed in package.json.

## Development Workflow

### Local Development

```bash
npm run dev
```

Starts the Vite development server with hot reload enabled.

### Building for Production

```bash
npm run build
```

Creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

## Code Quality

### Type Checking

```bash
npm run check
```

Runs Svelte type checking and TypeScript compilation.

### Linting

ESLint is configured for code quality. Run via your editor or IDE.

### Formatting

Prettier is configured for code formatting. Run via your editor or IDE.

## Project Structure

- **src/**: Main source code
- **src/konva/**: Canvas rendering logic
- **src/ui/**: UI components
- **src/stores/**: State management
- **src/data/**: Static data files

## Technologies Used

- **Svelte 5**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Konva.js**: Canvas rendering
- **Tailwind CSS**: Styling

## No Testing Framework

The project does not currently have automated tests configured.

## No Deployment Configuration

No CI/CD pipelines or deployment scripts are currently configured. The application is built as a static site that can be deployed to any static hosting service.