# Project Overview

## Project Name
TimelessCalc

## Purpose
A web application for calculating and visualizing Path of Exile passive tree jewel configurations. Users can explore timeless jewel possibilities, calculate optimal seeds, and visualize results on the passive skill tree.

## Executive Summary
TimelessCalc is a specialized tool for Path of Exile players to analyze and optimize their timeless jewel setups. It provides an interactive canvas-based visualization of the passive skill tree combined with powerful search and calculation tools for finding the best jewel configurations.

## Technology Stack Summary
- **Frontend**: Svelte 5 + TypeScript
- **Rendering**: Konva.js canvas
- **Styling**: Tailwind CSS
- **Build**: Vite
- **Data**: Static JSON/JSONL files

## Architecture Type Classification
Frontend-only web application with canvas-based visualization.

## Repository Structure
Monolithic frontend application with clear separation of concerns:
- UI components in `src/ui/`
- Canvas rendering in `src/konva/`
- State management in `src/stores/`
- Data providers in `src/providers/`

## Key Features
- Interactive passive skill tree visualization
- Timeless jewel seed calculation and optimization
- Trade API integration for market data
- Multiple platform and league support
- Real-time stat filtering and results

## Links to Detailed Documentation
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory-main.md)
- [Development Guide](./development-guide-main.md)
- [API Contracts](./api-contracts-main.md)
- [Data Models](./data-models-main.md)

## Getting Started
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev` to start development server
4. Open browser to the displayed URL

The application loads all necessary data on startup and provides an intuitive interface for exploring timeless jewel configurations.