import Konva from "konva";
import { treeStore } from "$lib/stores/treeStore";
import { get } from "svelte/store";
import { canvas } from "$lib/konva/canvasContext";

export function setupClick() {
  const stage = canvas.stage!,
    nodes = canvas.treeData.nodes,
    socketNodes = canvas.treeData.socketNodes;
  // ---------- CLIC ----------
  stage.on("click tap", (e) => {
    const treeState = get(treeStore);
    const shape = e.target;
    if (shape instanceof Konva.Circle) {
      const skill = Number(shape.name());
      const node =
        nodes[Object.keys(nodes).find((k) => nodes[k].skill === skill)!];
      const nodeId = String(node.skill);
      if (node.isJewelSocket) {
        if (treeState.chosenSocket === node) {
          treeStore.update((state) => {
            state.chosenSocket = null;
            return state;
          });
        } else {
          treeStore.update((state) => {
            state.chosenSocket = node;
            return state;
          });
        }
        return;
      }
      if (
        treeState.chosenSocket &&
        socketNodes[treeState.chosenSocket.skill].includes(nodeId)
      ) {
        treeStore.update((state) => {
          if (state.allocated.has(nodeId)) {
            state.allocated.delete(nodeId);
          } else {
            state.allocated.set(nodeId, node);
          }
          return state;
        });
      }
    }
  });
}
