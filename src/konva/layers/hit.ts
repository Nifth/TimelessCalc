import type { Node } from "$lib/types";
import Konva from "konva";
import { canvas } from "$lib/konva/canvasContext";

export function createHitLayer()
{
    const layer = canvas.hitLayer!,
        data = canvas.treeData;
    Object.entries(data.nodes).forEach(([_, node]: [string, Node]) => {
        if (!node || !node.group) return;
        // node sprite
        if (node.classStartIndex !== undefined || node.isMastery || node.expansionJewel?.parent) return;
        const nodeX = node.x;
        const nodeY = node.y;
        const hit = new Konva.Circle({
            x: nodeX,
            y: nodeY,
            stroke: 'white',
            strokeWidth: 15,
            radius: node.isJewelSocket ? 100 : (node.isNotable || node.isKeystone) ? 90 : 50,
            name: node.skill.toString(),
            opacity: node.isJewelSocket ? 1 : 0,
            listening: true,
          });
          
          layer.add(hit);
    });
}