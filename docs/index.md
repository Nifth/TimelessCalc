# TimelessCalc Documentation Index

## Project Overview

**Type:** monolith with 1 parts

**Primary Language:** TypeScript

**Architecture:** Component-Based Frontend Architecture

## Quick Reference

**Tech Stack:** Svelte 5.43.8, TypeScript 5.9.3, Konva.js 10.0.12, Tailwind CSS 4.1.18

**Entry Point:** src/main.ts

**Architecture Pattern:** Component-Based Frontend Architecture

## Generated Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory-main.md)
- [Development Guide](./development-guide-main.md)
- [API Contracts](./api-contracts-main.md)
- [Data Models](./data-models-main.md)

## Existing Documentation

- [README.md](../README.md) - Project readme file
- [Roadmap.md](../Roadmap.md) - Project roadmap

## Getting Started

1. **Prerequisites**: Node.js and npm installed
2. **Installation**: Run `npm install` to install dependencies
3. **Development**: Run `npm run dev` to start the development server
4. **Build**: Run `npm run build` to create a production build
5. **Type Check**: Run `npm run check` to verify TypeScript types

The application provides an interactive interface for calculating and visualizing Path of Exile timeless jewel configurations using a canvas-based passive skill tree renderer.

## Features

### Loading Experience
- Modern animated preloader with wave effects and gem icon
- Smooth loading transition before passive tree visualization
- Path of Exile themed visual feedback during initialization

### Passive Tree Visualization
- Interactive canvas rendering of the Path of Exile passive skill tree
- Support for timeless jewel configurations with conqueror modifiers
- Node allocation and deallocation with visual feedback
- Zoom and pan controls for navigation

### Search and Filtering
- Search for optimal jewel configurations based on desired stats
- Filter by jewel type (Glorious Vanity, Lethal Pride, etc.)
- Select conqueror modifiers and specific stat requirements
- Real-time results with pagination and trade integration

### Sharing Configurations
- Generate shareable URLs that encode current search filters and tree state
- Copy URL to clipboard for sharing configurations with others
- URL parameters include:
  - `jt`: Jewel type name
  - `c`: Conqueror label
  - `s`: Selected stats (JSON array)
  - `seed`: Seed number
  - `l`: League name
  - `p`: Platform (PC/Xbox/Playstation)
  - `so`: Socket skill ID
  - `a`/`un`: Allocated or unallocated node skills (JSON array)