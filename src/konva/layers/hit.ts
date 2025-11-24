import type { Node, TreeData } from "$lib/types";
import Konva from "konva";

export function createHitLayer(layer: Konva.Layer, data: TreeData)
{
    Object.entries(data.nodes).forEach(([_, node]: [string, Node]) => {
        if (!node || !node.group) return;
        // node sprite
        if (node.classStartIndex !== undefined || node.isMastery) return;
        const nodeX = node.x;
        const nodeY = node.y;
        const hit = new Konva.Circle({
            x: nodeX,
            y: nodeY,
            radius: node.isNotable || node.isKeystone ? 90 : 70,
            name: node.skill.toString(),
            opacity: 0,
            listening: true,
          });
          
          layer.add(hit);
    });
}