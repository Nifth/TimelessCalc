import type { TreeData } from "$lib/types";
import type Konva from "konva";
import { createSprite } from "$lib/konva/utils/sprites";

export function drawBackground(layer: Konva.Layer, data: TreeData)
{
    Object.entries(data.groups).forEach(([_, group]: [any, any]) => {
        // background
        if (group.background) {
          if (group.background.isHalfImage) {
            const up = createSprite('groupBackground', group.background.image, group.x, group.y, 'halfUp');
            const down = createSprite('groupBackground', group.background.image, group.x, group.y, 'halfDown');
            layer.add(up, down);
          } else {
            const bg = createSprite('groupBackground', group.background.image, group.x, group.y);
            layer.add(bg);
          }
        }
    });
}