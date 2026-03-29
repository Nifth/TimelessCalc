import type { Node, TreeData, Sprite, Group } from "$lib/types";
import type { SkillIndex } from "$lib/utils/nodeUtils";

export interface CanvasState {
	width: number;
	height: number;
	offsetX: number;
	offsetY: number;
	scaling: number;
	mousePos: { x: number; y: number };
	hoveredNode: Node | null;
	isDragging: boolean;
	dragStartX: number;
	dragStartY: number;
	highlightedStatKeys: number[] | null;
	highlightVersion: number;
}

export const canvas = {
	treeData: null! as TreeData,
	skillIndex: null! as SkillIndex,
	spriteCache: new Map<string, HTMLImageElement>(),
	spriteConfig: new Map<string, Sprite>(),
	drawnGroups: new Map<number, Group>(),
	drawnNodes: new Map<number, Node>(),
	precomputedConnections: [] as Array<{
		nodeA: Node;
		nodeB: Node;
		isArc: boolean;
	}>,
	state: {
		width: typeof window !== "undefined" ? window.innerWidth : 0,
		height: typeof window !== "undefined" ? window.innerHeight : 0,
		offsetX: 0,
		offsetY: 0,
		scaling: 10,
		mousePos: { x: Number.MIN_VALUE, y: Number.MIN_VALUE },
		hoveredNode: null as Node | null,
		isDragging: false,
		dragStartX: 0,
		dragStartY: 0,
		highlightedStatKeys: null as number[] | null,
		highlightVersion: 0,
	},
};
