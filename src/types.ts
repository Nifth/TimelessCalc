export interface Group {
  x: number;
  y: number;
  isProxy: boolean;
  orbits: number[];
  background?: {
    image: string;
    isHalfImage?: boolean;
  };
  nodes: string[];
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
  group?: number;
  orbit?: number;
  orbitIndex?: number;
  out?: string[];
  in?: string[];
  reminderText?: string[];
  inactiveIcon?: string;
  conqueredName?: string | null;
  timelessStats?: string[];
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
}

export interface Translation {
  from: number | undefined;
  to: number | undefined;
  translation: string;
}

export interface JewelEntry {
  r: Record<string, number[]>;
  a: Record<string, number[]>;
}

export type JewelData = Record<string, JewelEntry>;
