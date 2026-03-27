export interface Group {
  x: number;
  y: number;
  orbits: number[];
  background?: {
    image: string;
    isHalfImage?: boolean;
  };
  nodes: string[];
}

export interface PerformanceMetrics {
  timing: Record<string, PerformanceMeasure>;
  memory: {
    initial: number;
    current: number;
    total: number;
    limit: number;
    delta: number;
  };
  network: {
    totalTransferred: number;
    totalDuration: number;
    requestCount: number;
  };
}

export interface ExpansionJewel {
  size: number;
  index: number;
  proxy: string;
  parent?: string;
}

export interface Node {
  skill: number;
  name: string;
  classStartIndex: number;
  icon?: string;
  isNotable?: boolean;
  isMastery?: boolean;
  isKeystone?: boolean;
  isJewelSocket?: boolean;
  expansionJewel?: ExpansionJewel;
  stats?: string[];
  group: number;
  orbit: number;
  orbitIndex: number;
  out: string[];
  in: string[];
  reminderText?: string[];
  inactiveIcon?: string;
  conqueredName?: string | null;
  timelessStats?: string[];
  timelessStatKeys?: number[];
  timelessStatValues?: number[];
  x: number;
  y: number;
}

export interface Coords {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Sprite {
  filename: string;
  w: number;
  h: number;
  coords: Record<string, Coords>;
}

export interface TreeData {
  tree: string;
  groups: Record<string, Group>;
  nodes: Record<string, Node>;
  constants: {
    orbitRadii: number[];
    skillsPerOrbit: number[];
    [key: string]: unknown;
  };
  min_x?: number;
  min_y?: number;
  max_x?: number;
  max_y?: number;
  imageZoomLevels?: number[];
  sprites: Record<string, Record<string, Sprite>>;
  socketNodes: Record<string, string[]>;
}

export interface JewelType {
  label: string;
  name: string;
  id: number;
  min: number;
  max: number;
}

export interface Conqueror {
  label: string;
  id: number;
  keystone: string;
  type: string;
}

export interface Stat {
  statKey: number;
  label: string;
  weight: number;
  minWeight: number;
  exclude?: boolean;
}

export type StatSearchMode = "occurrences" | "totalValue";

export interface Translation {
  from: number | undefined;
  to: number | undefined;
  divider: number | undefined;
  translation: string;
}

export interface JewelEntry {
  r: Record<string, number[]>;
  a: Record<string, number[]>;
}

export type JewelData = Record<string, JewelEntry>;

export interface League {
  name: string;
  start_date?: string;
  end_date?: string;
}

export type Platform = "PC" | "Xbox" | "Playstation";

export interface SearchStore {
  jewelType: JewelType | null;
  conqueror: Conqueror | null;
  seed: number | null;
  selectedStats: Stat[];
  searched: boolean;
  statsResults: Record<
    string,
    {
      seed: number;
      statCounts: Record<number, number>;
      statTotals: Record<number, number>;
      totalWeight: number;
    }[]
  >;
  statKeyColors: Record<number, string>;
  minTotalWeight: number;
  statSearchMode: StatSearchMode;
  league: string;
  platform: Platform;
  currentPage: number;
  totalResults: number;
  orderedSeeds: number[];
  lastTradeInfo: {
    seeds: number[];
    conquerorLabel: string;
    page: number;
    groupName?: string;
  } | null;
  loading: boolean;
  mode: "seed" | "stats" | null;
  statsSearched: boolean;
  seedSearched: boolean;
  automated: boolean;
  jewelLoadError: { jewel: JewelType; message: string } | null;
}

export interface SearchHistoryEntry {
  id: string;
  timestamp: number;
  socket: Node;
  jewelType: JewelType;
  conqueror: Conqueror | null;
  stats: Stat[];
  minTotalWeight: number;
  allocatedSkillIds: string[];
  statSearchMode?: StatSearchMode;
}

export interface FavoriteEntry extends SearchHistoryEntry {
  name: string;
}

export interface TreeStore {
  chosenSocket: Node | null;
  allocated: Map<string, Node>;
  locked: Map<string, Node>;
  search: string;
  scale: number;
  hovered: Node | null;
  loading: boolean;
}

export interface SeedSearchResults {
  seed: number;
  jewelType: JewelType;
  socketResults: Record<string, SocketResult>;
}

export interface SocketResult {
  socketId: string;
  replacements: StatModification[];
  additions: StatModification[];
}

export interface StatModification {
  statKey: number;
  statValues: Record<string, number>;
  statLabel: string;
  nodeIds: number[];
  occurrenceCount: number;
}

export interface ParsedClipboard {
  seed: number;
  jewelType: JewelType | null;
}
