<script lang="ts">
import { onMount } from "svelte";
import { Canvas, Layer } from "svelte-canvas";
import { canvas } from "$lib/canvas/canvasContext";
import { distance, toCanvasCoords, type Point } from "$lib/canvas/utils/coordinate";
import {
	calculateNodePos,
	initializeDrawnData,
} from "$lib/canvas/utils/nodePositions";
import { preloadSprites } from "$lib/canvas/utils/sprites";
import { TREE_CONSTANTS } from "$lib/constants/tree";
import treeData from "$lib/data/tree.json" with { type: "json" };
import { mouseStore } from "$lib/stores/mouseStore";
import { searchStore } from "$lib/stores/searchStore";
import { treeStore } from "$lib/stores/treeStore";
import type { Node, TreeStore, SearchStore } from "$lib/types";

function drawClippedImage(
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	dx: number,
	dy: number,
	dw: number,
	dh: number,
) {
	ctx.save();
	ctx.beginPath();
	ctx.ellipse(dx + dw / 2, dy + dh / 2, dw / 2, dh / 2, 0, 0, Math.PI * 2);
	ctx.clip();
	ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
	ctx.restore();
}

let isInitialized = $state(false);
let canvasWidth = $state(0);
let canvasHeight = $state(0);
let cursorStyle = $state("default");
let cachedTreeState: TreeStore = { chosenSocket: null, allocated: new Map(), locked: new Map(), search: "", scale: 10, hovered: null, loading: false };
let cachedSearchState: SearchStore = { jewelType: null, conqueror: null, seed: null, selectedStats: [], searched: false, statsResults: {}, statKeyColors: {}, minTotalWeight: 0, statSearchMode: "occurrences", league: "Keepers", platform: "PC", currentPage: 0, totalResults: 0, orderedSeeds: [], lastTradeInfo: null, loading: false, mode: null, statsSearched: false, seedSearched: false, automated: false, jewelLoadError: null };
let { onRender = () => {} } = $props();

onMount(() => {
	const handleResize = () => {
		canvasWidth = window.innerWidth;
		canvasHeight = window.innerHeight;
		canvas.state.width = canvasWidth;
		canvas.state.height = canvasHeight;
	};
	window.addEventListener("resize", handleResize);

	const unsubTree = treeStore.subscribe((v) => {
		cachedTreeState = v;
		if (Math.abs(canvas.state.scaling - v.scale) > 0.001) {
			canvas.state.scaling = v.scale;
		}
	});
	const unsubSearch = searchStore.subscribe((v) => {
		cachedSearchState = v;
	});

	(async () => {
		canvasWidth = window.innerWidth;
		canvasHeight = window.innerHeight;

		canvas.treeData = JSON.parse(JSON.stringify(treeData));

		await preloadSprites(canvas.treeData.sprites);

		initializeDrawnData();

		const minX = canvas.treeData.min_x ?? 0;
		const minY = canvas.treeData.min_y ?? 0;
		const maxX = canvas.treeData.max_x ?? 0;
		const maxY = canvas.treeData.max_y ?? 0;
		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;
		canvas.state.offsetX =
			centerX - (window.innerWidth / 2) * canvas.state.scaling;
		canvas.state.offsetY =
			centerY - (window.innerHeight / 2) * canvas.state.scaling;

		treeStore.update((s) => ({ ...s, scale: canvas.state.scaling }));

		isInitialized = true;
	})();

	return () => {
		window.removeEventListener("resize", handleResize);
		unsubTree();
		unsubSearch();
	};
});

let hoverThrottle: number | null = null;
function checkHover(mouseX: number, mouseY: number) {
	if (hoverThrottle) return;
	hoverThrottle = requestAnimationFrame(() => {
		hoverThrottle = null;

		const { offsetX, offsetY, scaling } = canvas.state;
		let closestNode: Node | null = null;
		let closestDistance = Infinity;

		for (const [_, node] of canvas.drawnNodes) {
			if (node.isMastery || node.classStartIndex !== undefined) continue;

			const pos = calculateNodePos(node, offsetX, offsetY, scaling);
			const touchRadius = node.isJewelSocket
				? 100
				: node.isKeystone || node.isNotable
					? 90
					: 50;

			const dist = distance({ x: mouseX, y: mouseY }, pos);
			const scaledRadius = touchRadius / scaling;

			if (dist < scaledRadius && dist < closestDistance) {
				closestDistance = dist;
				closestNode = node;
			}
		}

		if (closestNode?.skill !== canvas.state.hoveredNode?.skill) {
			canvas.state.hoveredNode = closestNode;
			treeStore.update((s) => ({ ...s, hovered: closestNode }));
			mouseStore.set({ x: mouseX, y: mouseY });

			cursorStyle = closestNode?.isJewelSocket ? "pointer" : "default";
		} else {
			mouseStore.set({ x: mouseX, y: mouseY });
		}
	});
}

function handleClick(event: MouseEvent) {
	const { offsetX, offsetY, scaling } = canvas.state;

	for (const [_, node] of canvas.drawnNodes) {
		if (node.isMastery || node.classStartIndex !== undefined) continue;

		const pos = calculateNodePos(node, offsetX, offsetY, scaling);
		const touchRadius = node.isJewelSocket
			? 100
			: node.isKeystone || node.isNotable
				? 90
				: 50;
		const dist = distance({ x: event.offsetX, y: event.offsetY }, pos);
		const scaledRadius = touchRadius / scaling;

		if (dist < scaledRadius) {
			handleNodeClick(node, event);
			return;
		}
	}
}

function handleNodeClick(node: Node, event: MouseEvent) {
	const { chosenSocket } = cachedTreeState;
	const isCtrlClick = event.ctrlKey || event.metaKey;

	if (node.isJewelSocket) {
		const socketNodes = canvas.treeData.socketNodes[node.skill];

		if (chosenSocket?.skill === node.skill) {
			treeStore.update((s) => {
				s.chosenSocket = null;
				s.allocated = new Map();
				s.locked = new Map();
				return s;
			});
		} else {
			treeStore.update((s) => {
				s.chosenSocket = node;
				const newAllocated = new Map<string, Node>();
				if (socketNodes) {
					for (const nodeId of socketNodes) {
						const targetNode = canvas.treeData.nodes[nodeId];
						if (targetNode) {
							newAllocated.set(nodeId, targetNode);
						}
					}
				}
				s.allocated = newAllocated;
				s.locked = new Map();
				return s;
			});
		}
	} else if (chosenSocket) {
		const nodeId = node.skill.toString();
		const socketNodes =
			canvas.treeData.socketNodes[chosenSocket.skill];

		if (socketNodes?.includes(nodeId)) {
			if (isCtrlClick) {
				treeStore.update((s) => {
					if (s.locked.has(nodeId)) {
						s.locked.delete(nodeId);
					} else {
						if (!s.allocated.has(nodeId)) {
							s.allocated.set(nodeId, node);
						}
						s.locked.set(nodeId, node);
					}
					return s;
				});
			} else {
				treeStore.update((s) => {
					const newAllocated = new Map(s.allocated);
					if (newAllocated.has(nodeId)) {
						newAllocated.delete(nodeId);
						s.locked.delete(nodeId);
					} else {
						newAllocated.set(nodeId, node);
					}
					s.allocated = newAllocated;
					return s;
				});
			}
		}
	}
}

function handlePointerDown(event: PointerEvent) {
	canvas.state.isDragging = true;
	canvas.state.dragStartX = event.offsetX;
	canvas.state.dragStartY = event.offsetY;
}

function handlePointerMove(event: PointerEvent) {
	checkHover(event.offsetX, event.offsetY);

	if (canvas.state.isDragging) {
		const dx = event.offsetX - canvas.state.dragStartX;
		const dy = event.offsetY - canvas.state.dragStartY;

		canvas.state.offsetX -= dx * canvas.state.scaling;
		canvas.state.offsetY -= dy * canvas.state.scaling;

		canvas.state.dragStartX = event.offsetX;
		canvas.state.dragStartY = event.offsetY;
	}
}

function handlePointerUp(event: PointerEvent) {
	canvas.state.isDragging = false;
	handleClick(event as unknown as MouseEvent);
}

let zoomTimeout: number | null = null;
function handleWheel(event: WheelEvent) {
	event.preventDefault();
	event.stopPropagation();

	if (zoomTimeout) return;

	zoomTimeout = requestAnimationFrame(() => {
		zoomTimeout = null;

		const { offsetX, offsetY, scaling } = canvas.state;
		const oldScale = scaling;

		const newScale = event.deltaY > 0 ? oldScale * 1.1 : oldScale * 0.9;
		const clampedScale = Math.max(1, Math.min(50, newScale));

		const mouseX = event.offsetX;
		const mouseY = event.offsetY;

		const worldX = mouseX * oldScale + offsetX;
		const worldY = mouseY * oldScale + offsetY;

		const newOffsetX = worldX - mouseX * clampedScale;
		const newOffsetY = worldY - mouseY * clampedScale;

		canvas.state.scaling = clampedScale;
		canvas.state.offsetX = newOffsetX;
		canvas.state.offsetY = newOffsetY;

		treeStore.update((s) => ({ ...s, scale: clampedScale }));
	});
}

function drawLockIcon(
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	scaling: number,
) {
	const lockSize = 80 / scaling;

	const lockX = x + lockSize * 1;
	const lockY = y - lockSize * 1.4;
	const bodyW = lockSize * 0.7;
	const bodyH = lockSize * 0.5;
	const shackleW = lockSize * 0.35;

	context.save();

	context.fillStyle = "#FFD700";
	context.strokeStyle = "#FFD700";
	context.lineWidth = 6 / scaling;

	context.beginPath();
	context.arc(lockX, lockY - bodyH * 0.05, shackleW, Math.PI, 0, false);
	context.stroke();

	context.fillRect(lockX - bodyW / 2, lockY, bodyW, bodyH);
	context.strokeRect(lockX - bodyW / 2, lockY, bodyW, bodyH);

	context.beginPath();
	context.arc(lockX, lockY + bodyH * 0.2, lockSize * 0.08, 0, Math.PI * 2);
	context.fill();

	context.restore();
}

type RenderParams = {
	context: CanvasRenderingContext2D;
	width: number;
	height: number;
};

const render = ({ context, width, height }: RenderParams) => {
	if (!isInitialized) return;

	const start = performance.now();
	const { offsetX, offsetY, scaling } = canvas.state;
	const { chosenSocket, allocated, locked } = cachedTreeState;
	const drawScale = 2 / scaling;
	const invScaling = 1 / scaling;
	const lineWidth = 4 * invScaling;

	const posCache = new Map<number, Point>();

	const getCachedPos = (node: Node): Point => {
		let pos = posCache.get(node.skill);
		if (pos) return pos;
		pos = toCanvasCoords(node.x, node.y, offsetX, offsetY, scaling);
		posCache.set(node.skill, pos);
		return pos;
	};

	const margin = 500;
	const vpMinX = offsetX - margin;
	const vpMaxX = offsetX + width * scaling + margin;
	const vpMinY = offsetY - margin;
	const vpMaxY = offsetY + height * scaling + margin;
	const isInViewport = (x: number, y: number) =>
		x >= vpMinX && x <= vpMaxX && y >= vpMinY && y <= vpMaxY;

	context.clearRect(0, 0, width, height);
	context.fillStyle = "#070c11";
	context.fillRect(0, 0, width, height);

	const bgSprite = canvas.spriteConfig.get(
		TREE_CONSTANTS.SPRITES.GROUP_BACKGROUND,
	);
	const bgImage = canvas.spriteCache.get(
		TREE_CONSTANTS.SPRITES.GROUP_BACKGROUND,
	);

	if (bgSprite && bgImage) {
		for (const [_, group] of canvas.drawnGroups) {
			if (!group.background) continue;
			if (!isInViewport(group.x, group.y)) continue;

			const groupPos = toCanvasCoords(
				group.x,
				group.y,
				offsetX,
				offsetY,
				scaling,
			);

			const coords = bgSprite.coords[group.background.image];
			if (!coords) continue;

			const w = coords.w * drawScale;
			const h = coords.h * drawScale;

			if (group.background.isHalfImage) {
				context.drawImage(
					bgImage,
					coords.x,
					coords.y,
					coords.w,
					coords.h,
					groupPos.x - w / 2,
					groupPos.y - h,
					w,
					h,
				);
				context.save();
				context.translate(groupPos.x, groupPos.y + h);
				context.scale(1, -1);
				context.drawImage(
					bgImage,
					coords.x,
					coords.y,
					coords.w,
					coords.h,
					-w / 2,
					0,
					w,
					h,
				);
				context.restore();
			} else {
				drawClippedImage(
					context,
					bgImage,
					coords.x,
					coords.y,
					coords.w,
					coords.h,
					groupPos.x - w / 2,
					groupPos.y - h / 2,
					w,
					h,
				);
			}
		}
	}

	context.lineWidth = lineWidth;
	context.strokeStyle = TREE_CONSTANTS.LINE_COLOR;

	for (const conn of canvas.precomputedConnections) {
		const { nodeA, nodeB, isArc } = conn;

		if (!isInViewport(nodeA.x, nodeA.y) && !isInViewport(nodeB.x, nodeB.y))
			continue;

		if (isArc) {
			const group = canvas.treeData.groups[nodeA.group.toString()];
			const groupPos = toCanvasCoords(
				group.x,
				group.y,
				offsetX,
				offsetY,
				scaling,
			);
			const count = canvas.treeData.constants.skillsPerOrbit[nodeA.orbit];

			const angle1 =
				(2 * Math.PI * nodeA.orbitIndex!) / count - Math.PI / 2;
			const angle2 =
				(2 * Math.PI * nodeB.orbitIndex!) / count - Math.PI / 2;

			let delta = angle2 - angle1;
			if (Math.abs(delta) > Math.PI) {
				delta += delta > 0 ? -2 * Math.PI : 2 * Math.PI;
			}

			const radius =
				canvas.treeData.constants.orbitRadii[nodeA.orbit] * invScaling;
			context.beginPath();
			context.arc(
				groupPos.x,
				groupPos.y,
				radius,
				angle1,
				angle1 + delta,
				delta < 0,
			);
			context.stroke();
		} else {
			const pos1 = getCachedPos(nodeA);
			const pos2 = getCachedPos(nodeB);
			context.beginPath();
			context.moveTo(pos1.x, pos1.y);
			context.lineTo(pos2.x, pos2.y);
			context.stroke();
		}
	}

	const frameSprite = canvas.spriteConfig.get(TREE_CONSTANTS.SPRITES.FRAME);
	const frameImage = frameSprite
		? canvas.spriteCache.get(TREE_CONSTANTS.SPRITES.FRAME)
		: null;

	for (const [_, node] of canvas.drawnNodes) {
		if (!isInViewport(node.x, node.y)) continue;

		const pos = getCachedPos(node);
		const isActive = allocated.has(node.skill.toString());

		if (node.classStartIndex !== undefined) {
			const sprite = canvas.spriteConfig.get(
				TREE_CONSTANTS.SPRITES.START_NODE,
			);
			if (!sprite) continue;
			const image = canvas.spriteCache.get(
				TREE_CONSTANTS.SPRITES.START_NODE,
			);
			if (!image) continue;
			const coords =
				sprite.coords[TREE_CONSTANTS.SPRITES.START_BACKGROUND];
			if (!coords) continue;
			const w = coords.w * drawScale;
			const h = coords.h * drawScale;
			drawClippedImage(
				context,
				image,
				coords.x,
				coords.y,
				coords.w,
				coords.h,
				pos.x - w / 2,
				pos.y - h / 2,
				w,
				h,
			);
			continue;
		}

		if (node.isJewelSocket) {
			if (node.expansionJewel?.parent) continue;

			const isSelected = chosenSocket?.skill === node.skill;
			const type = node.expansionJewel
				? isSelected
					? TREE_CONSTANTS.SPRITES.CLUSTER_ACTIVE
					: TREE_CONSTANTS.SPRITES.CLUSTER_UNALLOCATED
				: isSelected
					? TREE_CONSTANTS.SPRITES.JEWEL_FRAME_ACTIVE
					: TREE_CONSTANTS.SPRITES.JEWEL_FRAME_UNALLOCATED;

			if (!frameSprite || !frameImage) continue;
			const coords = frameSprite.coords[type];
			if (!coords) continue;

			drawClippedImage(
				context,
				frameImage,
				coords.x,
				coords.y,
				coords.w,
				coords.h,
				pos.x - (coords.w * drawScale) / 2,
				pos.y - (coords.h * drawScale) / 2,
				coords.w * drawScale,
				coords.h * drawScale,
			);

			if (!isSelected) {
				context.beginPath();
				context.arc(pos.x, pos.y, 100 * invScaling, 0, Math.PI * 2);
				context.strokeStyle = "rgba(183, 0, 255, 1)";
				context.lineWidth = 15 * invScaling;
				context.stroke();
				context.lineWidth = lineWidth;
				context.strokeStyle = TREE_CONSTANTS.LINE_COLOR;
			}
			continue;
		}

		if (node.isMastery) {
			const masteryKey = node.inactiveIcon
				? TREE_CONSTANTS.SPRITES.MASTERY_INACTIVE
				: TREE_CONSTANTS.SPRITES.MASTERY;
			const masterySprite = canvas.spriteConfig.get(masteryKey);
			if (!masterySprite) continue;
			const icon =
				node.inactiveIcon ||
				node.icon ||
				TREE_CONSTANTS.SPRITES.DEFAULT_ICON;
			const iconCoords = masterySprite.coords[icon];
			if (!iconCoords) continue;
			const masteryImage = canvas.spriteCache.get(masteryKey);
			if (!masteryImage) continue;

			drawClippedImage(
				context,
				masteryImage,
				iconCoords.x,
				iconCoords.y,
				iconCoords.w,
				iconCoords.h,
				pos.x - (iconCoords.w * drawScale) / 2,
				pos.y - (iconCoords.h * drawScale) / 2,
				iconCoords.w * drawScale,
				iconCoords.h * drawScale,
			);
			continue;
		}

		let iconKey: string, frameKey: string;
		if (isActive) {
			iconKey = node.isKeystone
				? TREE_CONSTANTS.SPRITES.KEYSTONE_ACTIVE
				: node.isNotable
					? TREE_CONSTANTS.SPRITES.NOTABLE_ACTIVE
					: TREE_CONSTANTS.SPRITES.NORMAL_ACTIVE;
			frameKey = node.isKeystone
				? TREE_CONSTANTS.SPRITES.KEYSTONE_FRAME_ACTIVE
				: node.isNotable
					? TREE_CONSTANTS.SPRITES.NOTABLE_FRAME_ACTIVE
					: TREE_CONSTANTS.SPRITES.DEFAULT_FRAME_ACTIVE;
		} else {
			iconKey = node.isKeystone
				? TREE_CONSTANTS.SPRITES.KEYSTONE_INACTIVE
				: node.isNotable
					? TREE_CONSTANTS.SPRITES.NOTABLE_INACTIVE
					: TREE_CONSTANTS.SPRITES.NORMAL_INACTIVE;
			frameKey = node.isKeystone
				? TREE_CONSTANTS.SPRITES.KEYSTONE_FRAME_UNALLOCATED
				: node.isNotable
					? TREE_CONSTANTS.SPRITES.NOTABLE_FRAME_UNALLOCATED
					: TREE_CONSTANTS.SPRITES.DEFAULT_FRAME;
		}

		const icon =
			node.icon ||
			node.inactiveIcon ||
			TREE_CONSTANTS.SPRITES.DEFAULT_ICON;
		const iconSprite = canvas.spriteConfig.get(iconKey);
		if (!iconSprite || !frameSprite) continue;

		const iconCoords = iconSprite.coords[icon];
		const frameCoords = frameSprite.coords[frameKey];
		if (!iconCoords || !frameCoords) continue;

		const iconImage = canvas.spriteCache.get(iconKey);
		if (!iconImage || !frameImage) continue;

		drawClippedImage(
			context,
			iconImage,
			iconCoords.x,
			iconCoords.y,
			iconCoords.w,
			iconCoords.h,
			pos.x - (iconCoords.w * drawScale) / 2,
			pos.y - (iconCoords.h * drawScale) / 2,
			iconCoords.w * drawScale,
			iconCoords.h * drawScale,
		);

		if (!node.isMastery) {
			drawClippedImage(
				context,
				frameImage,
				frameCoords.x,
				frameCoords.y,
				frameCoords.w,
				frameCoords.h,
				pos.x - (frameCoords.w * drawScale) / 2,
				pos.y - (frameCoords.h * drawScale) / 2,
				frameCoords.w * drawScale,
				frameCoords.h * drawScale,
			);
		}
	}

	for (const [nodeId, node] of locked) {
		if (!allocated.has(nodeId)) continue;
		const pos = getCachedPos(node);
		drawLockIcon(context, pos.x, pos.y, scaling);
	}

	if (chosenSocket) {
		const socketPos = getCachedPos(chosenSocket);
		const radiusSprite = canvas.spriteConfig.get(
			TREE_CONSTANTS.SPRITES.JEWEL_RADIUS,
		);
		if (!radiusSprite) {
			const end = performance.now();
			onRender(end - start);
			return;
		}

		const { jewelType } = cachedSearchState;
		const jewelTypeName = (jewelType?.name ??
			"default") as keyof typeof TREE_CONSTANTS.SOCKET.RADIUS_SPRITES;

		const radiusCoords1 =
			radiusSprite.coords[
				TREE_CONSTANTS.SOCKET.RADIUS_SPRITES[jewelTypeName].default
			];
		const radiusCoords2 =
			radiusSprite.coords[
				TREE_CONSTANTS.SOCKET.RADIUS_SPRITES[jewelTypeName].inverse
			];

		if (!radiusCoords1 || !radiusCoords2) {
			const end = performance.now();
			onRender(end - start);
			return;
		}

		const radiusImage = canvas.spriteCache.get(
			TREE_CONSTANTS.SPRITES.JEWEL_RADIUS,
		);
		if (!radiusImage) {
			const end = performance.now();
			onRender(end - start);
			return;
		}

		const jewelRadius = TREE_CONSTANTS.SOCKET.RADIUS;
		const ratio = radiusCoords1.w / 2;
		const radiusDrawScale = jewelRadius / ratio * invScaling;

		context.save();
		context.globalAlpha = TREE_CONSTANTS.SOCKET.OPACITY;

		context.drawImage(
			radiusImage,
			radiusCoords1.x,
			radiusCoords1.y,
			radiusCoords1.w,
			radiusCoords1.h,
			socketPos.x - (radiusCoords1.w * radiusDrawScale) / 2,
			socketPos.y - (radiusCoords1.h * radiusDrawScale) / 2,
			radiusCoords1.w * radiusDrawScale,
			radiusCoords1.h * radiusDrawScale,
		);

		if (jewelType) {
			context.drawImage(
				radiusImage,
				radiusCoords2.x,
				radiusCoords2.y,
				radiusCoords2.w,
				radiusCoords2.h,
				socketPos.x - (radiusCoords2.w * radiusDrawScale) / 2,
				socketPos.y - (radiusCoords2.h * radiusDrawScale) / 2,
				radiusCoords2.w * radiusDrawScale,
				radiusCoords2.h * radiusDrawScale,
			);
		}

		context.restore();
	}

	if (canvas.state.highlightedStatKeys) {
		const { statKeyColors } = cachedSearchState;
		const highlightedKeys = canvas.state.highlightedStatKeys;

		for (const [_, node] of allocated) {
			if (
				node?.timelessStatKeys?.some((key) =>
					highlightedKeys.includes(key),
				)
			) {
				const pos = getCachedPos(node);
				const radius = node.isNotable ? 90 : 60;

				let color = "yellow";
				for (const statKey of node.timelessStatKeys || []) {
					if (highlightedKeys.includes(statKey)) {
						color = statKeyColors[statKey] || color;
						break;
					}
				}

				context.beginPath();
				context.arc(pos.x, pos.y, radius * invScaling, 0, Math.PI * 2);
				context.strokeStyle = color;
				context.lineWidth = 15 * invScaling;
				context.stroke();
			}
		}
	}
	const end = performance.now();

	onRender(end - start);
};
</script>

{#if isInitialized && canvasWidth && canvasHeight}
  <div
    style="position: fixed; inset: 0; background: #070c11; overflow: hidden; cursor: {cursorStyle}"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onwheel={handleWheel}
  >
    <Canvas width={canvasWidth} height={canvasHeight} autoplay={true}>
      <Layer {render} />
    </Canvas>
  </div>
{/if}
