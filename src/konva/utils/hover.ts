import Konva from "konva";
import { mouseStore } from "$lib/stores/mouseStore";
import { treeStore } from "$lib/stores/treeStore";
import { canvas } from "$lib/konva/canvasContext";
import { get } from "svelte/store";

function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

export function setupHover() {
  const stage = canvas.stage!,
    hitLayer = canvas.hitLayer!,
    nodes = canvas.nodes,
    treeNodes = canvas.treeData.nodes;
  // ---------- HOVER ----------
  const throttledHover = throttle(() => {
    const p = stage.getPointerPosition()!;
    const shape = hitLayer.getIntersection(p);
    mouseStore.set({ x: p.x, y: p.y });
    if (shape instanceof Konva.Circle) {
      const skill = Number(shape.name());
      treeStore.update((state) => {
        const allocatedNode = state.allocated.get(skill.toString());
        if (allocatedNode) {
          state.hovered = allocatedNode;
        } else {
          const original =
            nodes.get(skill)?.node ||
            treeNodes[
              Object.keys(treeNodes).find((k) => treeNodes[k].skill === skill)!
            ];
          state.hovered = original;
        }
        return state;
      });
      if (get(treeStore).hovered?.isJewelSocket) {
        document.body.style.cursor = "pointer";
      }
    } else {
      treeStore.update((state) => {
        state.hovered = null;
        return state;
      });
      document.body.style.cursor = "default";
    }
  }, 16); // throttle to ~60fps

  stage.on("mousemove", throttledHover);
}
