---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish"]
inputDocuments: ["docs/index.md", "docs/project-overview.md", "docs/architecture.md", "docs/data-models-main.md", "docs/development-guide-main.md", "docs/source-tree-analysis.md", "docs/component-inventory-main.md", "docs/state-management-patterns-main.md", "docs/api-contracts-main.md"]
workflowType: 'prd'
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 9
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: brownfield
---

# Product Requirements Document - TimelessCalc

**Author:** Big dog
**Date:** 2026-01-18

## Executive Summary
TimelessCalc enhances Path of Exile gameplay by making timeless jewel optimization faster and more accessible, with sharing features to help content creators demonstrate setups to their audiences.

## Success Criteria

### User Success

- **Primary Outcome**: Users successfully find their optimal timeless jewel configuration within a reasonable time frame (e.g., under 5 minutes for a typical search)
- **Sharing Success**: Content creators can easily share their search configurations and results with others, enabling community learning and collaboration
- **Emotional Win**: Users feel confident they've found the "perfect" jewel setup for their build, reducing trial-and-error frustration

### Business Success

- **Community Adoption**: Growing number of active PoE players using the tool for jewel optimization
- **Content Creator Engagement**: Increasing shared searches and community guides built around the tool
- **Retention**: Users return regularly as they optimize new builds or explore different configurations

### Technical Success

- **Performance**: Search results returned within 2 seconds for typical queries
- **Accuracy**: Jewel calculations match PoE game mechanics with high reliability
- **Data Freshness**: Timely updates to reflect current league data and balance changes

## Product Scope

### MVP - Minimum Viable Product

- Core jewel optimization search functionality
- Basic passive tree visualization
- Essential filters for jewel type, conqueror, and stats

### Growth Features (Post-MVP)

- Sharing system for search configurations
- Advanced filtering and sorting options
- Community features (saved searches, trending configurations)

### Vision (Future)

- Advanced analytics for build optimization
- Integration with PoE trading tools
- Mobile app companion

## User Journeys

### Alex the PoE Player - "Finding the Perfect Setup"
Alex is a dedicated PoE player who's been grinding his Shadow character for weeks. He's heard about timeless jewels but the optimization process feels overwhelming - too many variables, too much trial and error. He discovers TimelessCalc through a forum post.

**Opening Scene**: Frustrated after losing another league race because his jewel setup isn't optimal, Alex searches "timeless jewel calculator" and finds the tool.

**Rising Action**: He selects his conqueror (Elegant Hubris), inputs his desired stats, and starts the search. The interface guides him through filters, and within minutes he sees results ranked by effectiveness.

**Climax**: He finds a configuration that perfectly matches his build requirements - the tool shows exactly where to socket the jewels and what seeds to use.

**Resolution**: Alex implements the setup in-game and notices immediate improvements in his character's performance. He bookmarks the tool for future builds, feeling confident in his optimization process.

### Sarah the Content Creator - "Sharing Optimization Knowledge"
Sarah runs a popular PoE YouTube channel where she creates build guides and optimization tutorials. Her viewers constantly ask about timeless jewel setups, but manually explaining complex configurations is time-consuming and error-prone.

**Opening Scene**: During a live stream, a viewer asks about an optimal jewel setup for a specific conqueror. Sarah knows the general approach but struggles to provide precise details.

**Rising Action**: She discovers TimelessCalc and uses it to generate several configuration options. The tool allows her to save and share specific search results.

**Climax**: She creates a shareable link for her optimal configuration and posts it in her video description and community Discord.

**Resolution**: Her viewers can now directly access the exact jewel setup, see the passive tree visualization, and implement it themselves. Sarah's guides become more valuable, and she gains reputation as a reliable optimization expert.

### Journey Requirements Summary
- **Search Interface**: Intuitive filters for jewel type, conqueror, stats, and seed ranges
- **Results Display**: Clear ranking of configurations with passive tree visualization
- **Sharing System**: Generate shareable links that preserve search parameters and results
- **Save/Load**: Ability to save favorite configurations for later use
- **Performance**: Fast search results to support live streaming scenarios