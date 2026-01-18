# TimelessCalc Roadmap

This roadmap outlines planned features and improvements for the TimelessCalc application, a Svelte + TypeScript tool for calculating and visualizing Path of Exile timeless jewel configurations.

## Features

### Theme Toggle
Add a dark/light theme toggle in the UI with persistent storage using localStorage. Allow users to switch themes dynamically without page reload.

### Search History
Implement a search history feature that stores recent queries in localStorage. Display a dropdown or sidebar section showing previous searches for quick access.

### Jewel Export
Add buttons to export a given seed as Path of Exile format, ready for POB import, in clipboard. For "Any" conqueror, let's just use the first one we find (non Any).

### Jewel Import
Capture Ctrl+V shortcut to paste a jewel (Path of Exile format), validate, if valid, show a modal / something to display the possible stats for each socket

### Undo/Redo Functionality
Implement undo/redo for node allocations using a command pattern. Store allocation history in memory with keyboard shortcuts (Ctrl+Z/Y) and UI buttons.

### Mobile Responsive Design
Make the UI fully responsive for mobile devices. Adjust sidebar positioning, canvas controls, and touch interactions for smaller screens.

### Node Filtering
Add filters to show/hide nodes by type (keystone, notable, mastery) or stats. Include search within stats for specific modifiers.

### Allocation Animations
Add smooth animations when allocating/deallocating nodes. Use CSS transitions or Konva animations for visual feedback.

### Virtual Scrolling Optimization
Optimize Konva rendering for large passive trees using virtual scrolling techniques. Only render visible nodes and layers to improve performance on lower-end devices.

### Help button
Add a "?" floating icon to help users, with list of shortcuts, how it works, what it is, how it's done.

### Debug Panel
1. Considérer rendre le Debug Panel conditionnel pour la production (param ?debug pour trigger le debug panel, si absent, complètement ignoré)
2. Ajouter des guards pour les APIs non-standards (performance.memory)