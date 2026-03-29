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

	const seen = new Set<string>();
	for (const [_, node] of drawnNodes) {
		if (!node.out || node.isMastery) continue;

		for (const targetId of node.out) {
			const target = tree.nodes[targetId];
			if (
				!target ||
				target.isMastery ||
				target.classStartIndex !== undefined ||
				node.classStartIndex !== undefined
			)
				continue;

			const min = Math.min(node.skill, target.skill);
			const max = Math.max(node.skill, target.skill);
			const key = `${min}-${max}`;
			if (seen.has(key)) continue;
			seen.add(key);

			canvas.precomputedConnections.push({
				nodeA: node,
				nodeB: target,
				isArc:
					node.group === target.group &&
					node.orbit === target.orbit &&
					node.orbit > 0,
			});
		}
	}
}
