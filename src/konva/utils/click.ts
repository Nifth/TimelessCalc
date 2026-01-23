import Konva from "konva";
import { treeStore } from "$lib/stores/treeStore";
import { get } from "svelte/store";
import { canvas } from "$lib/konva/canvasContext";
import { updateAllocatedDisplay, clearHighlights } from "./jewelHighlight";
import { findNodeBySkill } from "$lib/utils/nodeUtils";

export function setupClick() {
  const stage = canvas.stage!,
    nodes = canvas.treeData.nodes,
    socketNodes = canvas.treeData.socketNodes;
  // ---------- CLICK ----------
  stage.on("click tap", (e) => {
    const treeState = get(treeStore);
    const shape = e.target;
    if (shape instanceof Konva.Circle) {
      const skill = Number(shape.name());
      const node = findNodeBySkill(skill, nodes);
      if (!node) return;
      const nodeId = String(node.skill);
      if (node.isJewelSocket) {
        if (treeState.chosenSocket === node) {
          const socketSkill = treeState.chosenSocket.skill;
          treeStore.update((state) => {
            state.chosenSocket = null;
            return state;
          });
          clearHighlights();
          const socketNodeIds = canvas.treeData.socketNodes[socketSkill];
          for (const nodeId of socketNodeIds) {
            const node = canvas.treeData.nodes[nodeId];
            node.timelessStats = undefined;
            node.timelessStatKeys = undefined;
            node.timelessStatValues = undefined;
          }
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
        updateAllocatedDisplay();
      }
    }
  });
}
