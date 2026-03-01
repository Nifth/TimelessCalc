import { canvas } from "../canvasContext";

export interface Point {
	x: number;
	y: number;
}

export function toCanvasCoords(
	x: number,
	y: number,
	offsetX: number,
	offsetY: number,
	scaling: number,
): Point {
	return {
		x: (x - offsetX) / scaling,
		y: (y - offsetY) / scaling,
	};
}

export function rotateAroundPoint(
	center: Point,
	target: Point,
	angleRadians: number,
): Point {
	const cos = Math.cos(angleRadians);
	const sin = Math.sin(angleRadians);
	return {
		x: cos * (target.x - center.x) + sin * (target.y - center.y) + center.x,
		y: cos * (target.y - center.y) - sin * (target.x - center.x) + center.y,
	};
}

export function distance(p1: Point, p2: Point): number {
	return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function screenToWorld(
	screenX: number,
	screenY: number,
): { x: number; y: number } {
	const { offsetX, offsetY, scaling } = canvas.state;
	const tree = canvas.treeData;
	const absMinX = Math.abs(tree.min_x || 0);
	const absMinY = Math.abs(tree.min_y || 0);
	return {
		x: screenX * scaling - offsetX - absMinX,
		y: screenY * scaling - offsetY - absMinY,
	};
}
