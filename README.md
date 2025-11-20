# TimelessCalc
BUT LATER NEVER CAME

```bash
my-poe-tree/
├── src/                            # Code du front
│   ├── assets/                     # Assets statiques
│   │   ├── styles.css              # CSS global : layout, sidebar, canvas
│   │   └── sprites/                # Images (nodes, sockets, fonds) si besoin
│   ├── components/                 # Modules logiques (pas React, juste organisation)
│   │   ├── tree/                   # Logique du rendu du tree
│   │   │   ├── types.ts            # Interfaces : Node, Tree, JewelEffect, Socket
│   │   │   ├── renderer.ts         # Rendu du tree : nodes, connexions, sockets, interactions
│   │   │   ├── state.ts            # Gestion d’état : nodes sélectionnés, jewel actif, socket choisi
│   │   │   └── utils.ts            # Helpers : calcul des positions, zoom, pan
│   │   ├── search/                 # Logique de la recherche
│   │   │   ├── types.ts            # Interfaces : SearchCriteria, SearchResult
│   │   │   ├── searcher.ts         # Logique de recherche : par seed ou par mods
│   │   │   ├── ui.ts               # Gestion de l’UI : formulaires, résultats
│   │   │   └── utils.ts            # Helpers : filtrage, calcul des poids
│   │   └── ui/                     # UI générale
│   │       ├── sidebar.ts          # Sidebar : inputs pour jewel, conqueror, seed
│   │       ├── controls.ts         # Contrôles : boutons de filtre, zoom, reset
│   │       └── tooltip.ts          # Affichage des tooltips (hover sur nodes)
│   ├── main.ts                     # Point d’entrée : init Konva, charge JSON, lie les composants
│   └── index.html                  # Page HTML : canvas + sidebar
├── package.json                    # Dépendances front : konva, @types/konva, vite, typescript
├── tsconfig.json                   # Config TypeScript pour le front
├── vite.config.ts                  # Config Vite pour build et dev
└── README.md                       # Doc : setup, scripts, déploiement
```
