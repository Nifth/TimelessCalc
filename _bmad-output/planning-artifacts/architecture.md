---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments: ["_bmad-output/planning-artifacts/prd.md", "docs/data-models-main.md", "docs/index.md", "docs/project-overview.md", "docs/architecture.md", "docs/development-guide-main.md", "docs/source-tree-analysis.md", "docs/component-inventory-main.md", "docs/state-management-patterns-main.md", "docs/api-contracts-main.md"]
workflowType: 'architecture'
project_name: 'TimelessCalc'
user_name: 'Big dog'
date: '2026-01-18'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Based on the PRD, the core functionality centers on search and calculation of timeless jewel configurations, with visualization on the passive skill tree. Architecturally, this requires efficient data structures for precomputed jewel statistics, canvas rendering for interactive tree display, and search algorithms that can filter and rank results quickly. The sharing system needs URL-based state management and link generation capabilities.

**Non-Functional Requirements:**
Performance is critical with sub-2 second search times, requiring optimized data loading and search algorithms. Accuracy must match Path of Exile mechanics exactly, necessitating careful validation of calculation logic. Data freshness for league updates and timely API responses are also important. The application must support multiple platforms (PC, Xbox, PS) with responsive canvas interactions.

**Scale & Complexity:**
The project is a low-complexity frontend application with no backend services, focusing on client-side data processing and visualization. It uses static data files and external APIs, making it suitable for deployment as a static web application.

- Primary domain: web frontend
- Complexity level: low
- Estimated architectural components: 4 main areas - data management, search logic, UI components, canvas rendering

### Technical Constraints & Dependencies

Frontend-only architecture using Svelte + TypeScript, Konva.js for canvas, static compressed data files, external APIs for league data and trade information. No backend database or server-side processing. Must handle large compressed JSONL files efficiently and integrate with PoE Watch and trade APIs.

### Cross-Cutting Concerns Identified

Performance optimization across data loading and search operations, data accuracy validation against game mechanics, responsive UI design for canvas interactions, platform compatibility for PC/Xbox/PS, and URL-based state management for sharing features.

## Starter Template Evaluation

### Primary Technology Domain

Web application based on project requirements analysis for a frontend-only timeless jewel calculator.

### Starter Options Considered

Your project uses a custom setup with Vite + Svelte + TypeScript, which aligns well with current best practices for modern web applications. I evaluated this against popular alternatives like Next.js, SvelteKit, and Vite + React starters.

### Selected Starter: Custom Vite + Svelte Setup

**Rationale for Selection:**
Your existing setup uses more current versions than the latest stable releases:
- Svelte 5.43.8 (vs stable 5.28.2)
- Konva.js 10.0.12 (vs stable 9.3.20)
- TypeScript 5.9.3 (current stable)
- Tailwind CSS 4.1.18 (current stable)

This custom foundation provides excellent performance for canvas-based interactions and maintains modern development practices.

**Initialization Command:**
(Already implemented - this was your project's starting foundation)

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript 5.9.3 with strict configuration for type safety in a frontend-only application.

**Styling Solution:**
Tailwind CSS 4.1.18 for utility-first styling, well-suited for component-based UI development.

**Build Tooling:**
Vite 7.2.5 for fast development server and optimized production builds, ideal for frontend applications.

**Testing Framework:**
No testing framework currently configured - this could be an area for future enhancement.

**Code Organization:**
Clear separation of concerns with dedicated directories for components (ui/), rendering (konva/), state management (stores/), and data providers. Follows component-based architecture patterns.

**Development Experience:**
Hot reloading via Vite, TypeScript support, ESLint and Prettier for code quality, and a structured project layout that supports collaborative development.

**Note:** This foundation has proven effective for your canvas-heavy application requiring real-time interactions and static data handling.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
Data architecture using static files was critical for the frontend-only approach.

**Important Decisions (Shape Architecture):**
Frontend framework choice (Svelte), canvas library (Konva.js), and state management (Svelte stores) shaped the entire application architecture.

**Deferred Decisions (Post-MVP):**
Testing framework setup and advanced monitoring could be added later.

### Data Architecture

**Decision:** Static JSON/JSONL files with lazy loading and compression
**Version:** N/A (file-based)
**Rationale:** Frontend-only application with large precomputed datasets requiring efficient loading
**Affects:** Data providers, search performance
**Provided by Starter:** No, custom implementation

### Authentication & Security

**Decision:** Client-side only with no authentication required
**Version:** N/A
**Rationale:** Application handles public game data with no user accounts or sensitive information
**Affects:** No security middleware needed
**Provided by Starter:** Yes, inherent to frontend-only approach

### API & Communication Patterns

**Decision:** External API integration only (PoE Watch, trade APIs)
**Version:** REST APIs
**Rationale:** Limited to fetching league information and trade data
**Affects:** API providers and error handling
**Provided by Starter:** No, custom integration

### Frontend Architecture

**Decision:** Component-based with Svelte stores for state management
**Version:** Svelte 5.43.8
**Rationale:** Reactive UI components with centralized state for search parameters and results
**Affects:** All UI components and state updates
**Provided by Starter:** Yes, Svelte framework choice

### Infrastructure & Deployment

**Decision:** Static site hosting
**Version:** N/A
**Rationale:** No backend services required, can deploy to any static hosting provider
**Affects:** Build process and deployment strategy
**Provided by Starter:** Yes, Vite build output

### Decision Impact Analysis

**Implementation Sequence:**
1. Data architecture (static files) - foundation for all functionality
2. Frontend architecture (Svelte + stores) - core application framework
3. API integration - external data sources
4. Infrastructure - deployment setup

**Cross-Component Dependencies:**
Canvas rendering depends on data loading performance; search functionality depends on state management; UI components depend on both data and state layers.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 areas where AI agents could make different choices: naming conventions, project structure, data formats, component communication, and process patterns.

### Naming Patterns

**Database Naming Conventions:**
N/A - frontend-only application with no database.

**API Naming Conventions:**
External API endpoints follow their published conventions (PoE Watch, trade APIs). No internal API naming needed.

**Code Naming Conventions:**
- Components: PascalCase (UserCard, Sidebar)
- Files: kebab-case for Svelte components (user-card.svelte), camelCase for utilities (searchLogic.ts)
- Variables/Functions: camelCase (userData, getUserInfo)
- Types/Interfaces: PascalCase (UserData, SearchStore)

### Structure Patterns

**Project Organization:**
- UI components in `ui/` directory
- Canvas rendering logic in `konva/` directory
- State management in `stores/` directory
- Data providers in `providers/` directory
- Utilities in `utils/` directory with subdirectories by domain

**File Structure Patterns:**
- Configuration in root level (vite.config.ts, tsconfig.json)
- Static assets in `src/data/` and `public/`
- Tests would be co-located with components (*.test.ts files)

### Format Patterns

**API Response Formats:**
External APIs return their own formats. Application normalizes data through providers.

**Data Exchange Formats:**
JSON with camelCase properties, consistent with TypeScript conventions.

### Communication Patterns

**Event System Patterns:**
Svelte's reactive system handles component communication through props and store subscriptions.

**State Management Patterns:**
Immutable state updates through Svelte stores, reactive subscriptions for UI updates.

### Process Patterns

**Error Handling Patterns:**
Try/catch blocks around async operations, user-friendly error messages displayed in UI.

**Loading State Patterns:**
Boolean flags in stores (searched, loadingJewels), reactive UI updates.

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow established naming conventions for consistency
- Place code in appropriate directories according to the structure patterns
- Use the defined state management and communication patterns
- Handle errors and loading states consistently

**Pattern Enforcement:**
- Code reviews check for pattern compliance
- ESLint rules enforce naming conventions
- Pull requests document any pattern deviations

### Pattern Examples

**Good Examples:**
- Component: `ConquerorSelector.svelte` in `ui/` directory
- State: `searchStore.ts` with reactive properties
- Error handling: try/catch in API providers

**Anti-Patterns:**
- Placing components outside `ui/` directory
- Using inconsistent naming (mixing PascalCase and camelCase)
- Direct DOM manipulation instead of reactive updates

## Project Structure & Boundaries

### Complete Project Directory Structure

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
├── ui/                    # UI components
│   ├── BackButton.svelte
│   ├── ConquerorSelector.svelte
│   ├── JewelTypeSelector.svelte
│   ├── LeagueSelector.svelte
│   ├── ModeSelector.svelte
│   ├── Modal.svelte
│   ├── NodeToggles.svelte
│   ├── PlatformSelector.svelte
│   ├── SeedResultDisplay.svelte
│   ├── SeedSearch.svelte
│   ├── Sidebar.svelte
│   ├── SidebarHeader.svelte
│   ├── SidebarToggle.svelte
│   ├── StatsResults.svelte
│   ├── StatsSearch.svelte
│   ├── Tooltip.svelte
│   ├── TradeControls.svelte
│   └── TradeNotification.svelte
└── utils/
    └── sidebar/
        ├── options.ts
        ├── searchLogic.ts
        ├── sidebarUtils.ts
        └── tradeQuery.ts
```

### Architectural Boundaries

**API Boundaries:**
- External API endpoints (PoE Watch leagues, trade APIs)
- No internal API boundaries (frontend-only)

**Component Boundaries:**
- UI components communicate via props and store subscriptions
- Canvas rendering isolated in konva/ directory
- State managed centrally through stores/

**Service Boundaries:**
- Data providers handle external API calls
- Utilities contain shared business logic
- Constants define application-wide values

**Data Boundaries:**
- Static JSON/JSONL files for precomputed data
- External API responses normalized through providers
- In-memory state in Svelte stores

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- Jewel search functionality → `ui/SeedSearch.svelte`, `ui/StatsSearch.svelte`, `stores/searchStore.ts`
- Tree visualization → `konva/layers/`, `Tree.svelte`
- Sharing system → URL state management in stores
- Data loading → `providers/jewels.ts`, `providers/leagues.ts`

**Cross-Cutting Concerns:**
- Performance optimization → lazy loading in providers, compressed data files
- Error handling → try/catch in providers, UI error states
- Loading states → reactive store properties

### Integration Points

**Internal Communication:**
Components communicate through reactive props and Svelte store subscriptions, maintaining unidirectional data flow from providers → stores → components → canvas.

**External Integrations:**
- PoE Watch API for league data
- Trade APIs for market information
- Static data files for tree and jewel statistics

**Data Flow:**
External data → providers (normalization) → stores (state) → components (UI) → canvas (rendering)

### File Organization Patterns

**Configuration Files:**
Root-level configuration (package.json, vite.config.ts, tsconfig.json)

**Source Organization:**
Clear separation by concern: ui/, konva/, stores/, providers/, utils/

**Test Organization:**
Tests would be co-located with components (*.test.ts files)

**Asset Organization:**
Static data in src/data/, sprites and assets referenced from data files

### Development Workflow Integration

**Development Server Structure:**
Vite serves from src/, hot reload enabled for all .svelte, .ts files

**Build Process Structure:**
Vite builds to dist/, processes TypeScript and Svelte compilation

**Deployment Structure:**
Static files in dist/ suitable for any static hosting provider

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together seamlessly: Svelte's reactive system integrates perfectly with Konva.js canvas rendering, TypeScript provides type safety across all components, and the static data approach eliminates backend complexity while maintaining performance.

**Pattern Consistency:**
Implementation patterns fully support the architectural decisions: naming conventions align with TypeScript/JavaScript standards, structure patterns complement the component-based architecture, and communication patterns leverage Svelte's strengths.

**Structure Alignment:**
The project structure perfectly supports all architectural decisions with clear boundaries between UI, rendering, state, and data layers.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
All core features from the PRD are fully supported: jewel search and calculation through dedicated UI components and stores, tree visualization through the Konva.js canvas system, and sharing through URL-based state management.

**Functional Requirements Coverage:**
The three main functional requirement categories (search functionality, visualization, sharing) are completely covered by the architectural structure and component mapping.

**Non-Functional Requirements Coverage:**
Performance requirements are addressed through lazy loading and compressed data files, accuracy through TypeScript and careful data handling, and platform compatibility through the web-based approach.

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical decisions are documented with specific versions and rationales, providing clear guidance for implementation.

**Structure Completeness:**
The complete directory structure is defined with all files and directories mapped to specific requirements and components.

**Pattern Completeness:**
Comprehensive patterns cover all potential conflict areas with concrete examples and enforcement guidelines.

### Gap Analysis Results

**Critical Gaps:** None identified - all essential architectural elements are in place.

**Important Gaps:** Testing framework not implemented (documented as future enhancement).

**Nice-to-Have Gaps:** CI/CD pipeline could be added for automated deployment.

### Validation Issues Addressed

No critical issues found. The architecture is coherent, complete, and ready for consistent AI agent implementation.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High - based on comprehensive validation and existing successful implementation

**Key Strengths:**
- Well-validated architecture that matches successful implementation
- Clear patterns preventing AI agent conflicts
- Complete documentation for consistent future development
- Performance-optimized design for canvas-based interactions

**Areas for Future Enhancement:**
- Add testing framework for code quality assurance
- Consider CI/CD pipeline for deployment automation
- Monitor and potentially upgrade to latest stable versions

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
Your project is already implemented - this architecture document serves as the definitive guide for any future enhancements or AI-assisted development work.
