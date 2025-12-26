import { createSprite } from "$lib/konva/utils/sprites";
import { TREE_CONSTANTS } from "$lib/constants/tree";
import { canvas } from "$lib/konva/canvasContext";
import type { Group } from "$lib/types";

export function drawBackground() {
  const layer = canvas.backgroundLayer!,
    data = canvas.treeData;
  Object.entries(data.groups).forEach(([_, group]: [string, Group]) => {
    // background
    if (group.background) {
      if (group.background.isHalfImage) {
        const up = createSprite(
          TREE_CONSTANTS.SPRITES.GROUP_BACKGROUND,
          group.background.image,
          group.x,
          group.y,
          TREE_CONSTANTS.SPRITES.HALF_UP,
        );
        const down = createSprite(
          TREE_CONSTANTS.SPRITES.GROUP_BACKGROUND,
          group.background.image,
          group.x,
          group.y,
          TREE_CONSTANTS.SPRITES.HALF_DOWN,
        );
        layer.add(up, down);
      } else {
        const bg = createSprite(
          TREE_CONSTANTS.SPRITES.GROUP_BACKGROUND,
          group.background.image,
          group.x,
          group.y,
        );
        layer.add(bg);
      }
    }
  });
}
