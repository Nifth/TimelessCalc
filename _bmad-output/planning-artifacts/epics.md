---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments: ["prd.md", "architecture.md", "docs/index.md"]
---

# TimelessCalc - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for TimelessCalc, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Provide intuitive search interface with filters for jewel type, conqueror, stats, and seed ranges  
FR2: Display clear ranking of timeless jewel configurations with passive tree visualization  
FR3: Generate shareable links that preserve search parameters and results  
FR4: Enable saving and loading of favorite configurations  
FR5: Support core jewel optimization search functionality  
FR6: Provide basic passive tree visualization  
FR7: Include essential filters for jewel type, conqueror, and stats  
FR8: Implement advanced filtering and sorting options (post-MVP)  
FR9: Add community features for saved searches and trending configurations (post-MVP)

### NonFunctional Requirements

NFR1: Search results returned within 2 seconds for typical queries  
NFR2: Calculations must match Path of Exile game mechanics with high accuracy  
NFR3: Timely updates to reflect current league data and balance changes  
NFR4: Responsive canvas interactions supporting PC, Xbox, and PS platforms  
NFR5: Fast search results to support live streaming scenarios

### Additional Requirements

- Static site hosting for deployment (no backend services required)  
- Integration with external APIs (PoE Watch for league data, trade APIs for market information)  
- Efficient loading and processing of large compressed JSONL files  
- URL-based state management for sharing features  
- Canvas rendering performance optimization using Konva.js  
- Component-based architecture with Svelte stores for state management  
- TypeScript type safety across all components  

### FR Coverage Map

FR3: Epic 1 - Generate shareable links for configurations
FR4: Epic 2 - Save and load favorite configurations

## Epic List

### Epic 1: Sharing System
Users can generate and share optimized timeless jewel configurations through shareable links that preserve search parameters and results
**FRs covered:** FR3

### Epic 2: Configuration Management
Users can save and load their favorite jewel configurations for easy access and reuse
**FRs covered:** FR4

## Epic 1: Sharing System

Users can generate and share optimized timeless jewel configurations through shareable links that preserve search parameters and results

### Story 1.1: Generate Shareable Link

As a content creator,
I want to generate a shareable link for my current search configuration and results,
So that I can share it with my audience.

**Acceptance Criteria:**

**Given** I have performed a search with specific parameters and results displayed
**When** I click a "Share" button
**Then** a URL is generated that encodes my search parameters
**And** the URL can be copied to clipboard

### Story 1.2: Load Configuration from Shared Link

As a viewer,
I want to load a shared configuration by visiting the shared link,
So that I can see the exact search results and tree visualization.

**Acceptance Criteria:**

**Given** I have received a shared URL
**When** I visit the URL
**Then** the application loads with the shared search parameters applied
**And** the search results and tree visualization match the original configuration
**And** all filters and settings are restored from the URL

## Epic 2: Configuration Management

Users can save and load their favorite jewel configurations for easy access and reuse

### Story 2.1: Save Configuration

As a user,
I want to save my current search configuration as a favorite,
So that I can access it later without re-entering parameters.

**Acceptance Criteria:**

**Given** I have performed a search with specific parameters
**When** I click a "Save" button and provide a name
**Then** the configuration is stored locally in the browser
**And** I receive confirmation that it was saved
**And** the saved configuration includes all search filters and results

### Story 2.2: Load Saved Configuration

As a user,
I want to select and load a previously saved configuration from my favorites,
So that I can quickly apply my preferred search settings.

**Acceptance Criteria:**

**Given** I have saved configurations available
**When** I select a saved configuration from a list
**Then** the application loads with those parameters applied
**And** the search is automatically executed with the saved settings
**And** the tree visualization updates to show the results

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

<!-- End story repeat -->
