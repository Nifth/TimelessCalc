# TimelessCalc Roadmap

This roadmap outlines planned features and improvements for the TimelessCalc application, a Svelte + TypeScript tool for calculating and visualizing Path of Exile timeless jewel configurations.

## Features

### Jewel Export
Add buttons to export a given seed as Path of Exile format, ready for POB import, in clipboard. For "Any" conqueror, let's just use the first one we find (non Any).

### Jewel Import
Capture Ctrl+V shortcut to paste a jewel (Path of Exile format), validate, if valid, show a modal / something to display the possible stats for each socket

### Mobile Responsive Design
Make the UI fully responsive for mobile devices. Adjust sidebar positioning, canvas controls, and touch interactions for smaller screens.

### Virtual Scrolling Optimization
Optimize Konva rendering for large passive trees using virtual scrolling techniques. Only render visible nodes and layers to improve performance on lower-end devices.

### Debug Panel
1. Considérer rendre le Debug Panel conditionnel pour la production (param ?debug pour trigger le debug panel, si absent, complètement ignoré)
2. Ajouter des guards pour les APIs non-standards (performance.memory)