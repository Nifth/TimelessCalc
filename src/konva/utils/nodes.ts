import type { Node } from "$lib/types";
import { canvas } from "$lib/konva/canvasContext";

const highlightableNodes = new Map<string, Node>();

export function getHighlighteableNodes() {
  const data = canvas.treeData;
  if (highlightableNodes.size > 0) {
    return highlightableNodes;
  }
  for (const [_, nodeIds] of Object.entries(data.socketNodes)) {
    for (const element of nodeIds) {
      const node = data.nodes[element];
      if (node.isJewelSocket || node.isMastery || node.classStartIndex)
        continue;
      highlightableNodes.set(element, node);
    }
  }

  return highlightableNodes;
}
