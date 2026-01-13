import { treeStore } from "$lib/stores/treeStore";
import { get } from "svelte/store";
import { canvas } from "$lib/konva/canvasContext";

export function setupZoom() {
  const stage = canvas.stage!;
  stage.on("wheel", (e) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const oldScale = stage.scaleX();

    // zoom functionality
    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    treeStore.update((state) => {
      state.scale = Math.max(0.1, Math.min(0.4, newScale));
      return state;
    });
    const storeState = get(treeStore);

    // KONVA MANAGES EVERYTHING ITSELF (black magic that works)
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * storeState.scale,
      y: pointer.y - mousePointTo.y * storeState.scale,
    };

    stage.scale({ x: storeState.scale, y: storeState.scale });
    stage.position(newPos);
    stage.batchDraw();
  });
}
