import type { Node } from "$lib/types";
import { canvas } from "../canvasContext";
import { toCanvasCoords, type Point } from "./coordinate";

export function calculateNodePos(
	node: Node,
	offsetX: number,
	offsetY: number,
	scaling: number,
): Point {
	if (node.x === undefined || node.y === undefined) {
		return { x: 0, y: 0 };
	}

	return toCanvasCoords(node.x, node.y, offsetX, offsetY, scaling);
}

export function initializeDrawnData(): void {
	const tree = canvas.treeData;
	const { drawnGroups, drawnNodes } = canvas;

	for (const [groupIdStr, group] of Object.entries(tree.groups)) {
		const groupId = parseInt(groupIdStr);
		drawnGroups.set(groupId, group);

		for (const nodeId of group.nodes) {
			const node = tree.nodes[nodeId];

			if (node.expansionJewel?.parent) {
				continue;
			}

			drawnNodes.set(node.skill, node);
		}
	}
}
