import Konva from "konva";
import { mouseStore } from "$lib/stores/mouseStore";
import { treeStore } from "$lib/stores/treeStore";
import { canvas } from "$lib/konva/canvasContext";
import { get } from "svelte/store";
import type { Node } from "$lib/types";
import { getNodeWithFallback } from "$lib/utils/nodeUtils";
import { THROTTLE_MS } from "$lib/constants/performance";

function throttle<T extends (...args: never[]) => void>(
  func: T,
  limit: number,
): T {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

export function setupHover() {
  const stage = canvas.stage!,
    hitLayer = canvas.hitLayer!,
    nodes = canvas.nodes,
    treeNodes = canvas.treeData.nodes;

  // Cache optimization for hover state
  let lastShape: Konva.Shape | null = null;
  let lastPosition: { x: number; y: number } | null = null;
  let lastHoveredNode: Node | null = null;

  // ---------- HOVER ----------
  const throttledHover = throttle(() => {
    const p = stage.getPointerPosition()!;

    // Skip processing if position hasn't moved significantly
    if (
      lastPosition &&
      Math.abs(p.x - lastPosition.x) < 5 &&
      Math.abs(p.y - lastPosition.y) < 5
    ) {
      return;
    }

    const shape = hitLayer.getIntersection(p);

    // Update mouse position always (needed for tooltip)
    mouseStore.set({ x: p.x, y: p.y });

    // Skip if shape hasn't changed
    if (shape === lastShape) {
      lastPosition = { x: p.x, y: p.y };
      return;
    }

    lastShape = shape;
    lastPosition = { x: p.x, y: p.y };

    if (shape instanceof Konva.Circle) {
      const skill = Number(shape.name());

      // Find the node (cached approach)
      const hoveredNode = getNodeWithFallback(skill, {
        allocated: get(treeStore).allocated,
        canvasNodes: nodes,
        treeNodes: treeNodes,
      });

      // Only update store if hovered node actually changed
      if (hoveredNode?.skill !== lastHoveredNode?.skill) {
        treeStore.update((state) => {
          state.hovered = hoveredNode;
          return state;
        });
        lastHoveredNode = hoveredNode;
      }

      // Update cursor only if jewel socket status changed
      if (hoveredNode?.isJewelSocket) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    } else {
      // Only update if we previously had a hovered node
      if (lastHoveredNode !== null) {
        treeStore.update((state) => {
          state.hovered = null;
          return state;
        });
        lastHoveredNode = null;
        document.body.style.cursor = "default";
      }
    }
  }, THROTTLE_MS); // throttle to ~60fps

  stage.on("mousemove", throttledHover);

  // Return cleanup function
  return () => {
    stage.off("mousemove", throttledHover);
  };
}
