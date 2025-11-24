import type { Node } from "$lib/types";
import { canvas } from "$lib/konva/canvasContext";

const highlightableNodes = new Map<string, Node>();

export function getHighlighteableNodes() {
    const data = canvas.treeData;
    if (highlightableNodes.size > 0) {
        return highlightableNodes
    }
    Object.entries(data.socketNodes).forEach(([_, nodeIds]) => {
        for (let index = 0; index < nodeIds.length; index++) {
            const element = nodeIds[index];
            const node = data.nodes[element];
            if (node.isJewelSocket || node.isMastery || node.classStartIndex) return;
            highlightableNodes.set(element, data.nodes[element])
        }
    })

    return highlightableNodes;
}