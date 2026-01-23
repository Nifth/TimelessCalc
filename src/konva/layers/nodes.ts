import Konva from "konva";
import type { Node } from "$lib/types";
import { createSprite } from "../utils/sprites";
import { TREE_CONSTANTS } from "$lib/constants/tree";
import { canvas } from "$lib/konva/canvasContext";
import { NODE_DRAW_CHUNK_SIZE } from "$lib/constants/performance";

export function drawNodesProgressive(
  onProgress?: (progress: number, step: string) => void,
  onComplete?: () => void,
): Promise<void> {
  return new Promise((resolve) => {
    const layer = canvas.mainLayer!,
      data = canvas.treeData,
      jewelSocketImages = canvas.jewelImages;
    const nodeEntries = Object.entries(data.nodes);
    const totalNodes = nodeEntries.length;
    const chunkSize = NODE_DRAW_CHUNK_SIZE;
    let currentIndex = 0;

    function processChunk() {
      const endIndex = Math.min(currentIndex + chunkSize, totalNodes);
      const chunk = nodeEntries.slice(currentIndex, endIndex);

      chunk.forEach(([_, node]: [string, Node]) => {
        try {
          if (!node || !node.group) return;

          const nodeX = node.x;
          const nodeY = node.y;

          // node sprite
          if (node.classStartIndex !== undefined) {
            const img = createSprite(
              TREE_CONSTANTS.SPRITES.START_NODE,
              TREE_CONSTANTS.SPRITES.START_BACKGROUND,
              nodeX,
              nodeY,
            );
            layer.add(img);
            return;
          } else {
            if (node.isJewelSocket) {
              if (node.expansionJewel?.parent) return;
              const jewelType = node.expansionJewel
                ? TREE_CONSTANTS.SPRITES.CLUSTER_UNALLOCATED
                : TREE_CONSTANTS.SPRITES.JEWEL_FRAME_UNALLOCATED;
              const image = createSprite(
                TREE_CONSTANTS.SPRITES.FRAME,
                jewelType,
                nodeX,
                nodeY,
              );

              jewelSocketImages.set(node.skill, image);

              layer.add(image);
            } else {
              const key = node.isMastery
                ? node.inactiveIcon
                  ? TREE_CONSTANTS.SPRITES.MASTERY_INACTIVE
                  : TREE_CONSTANTS.SPRITES.MASTERY
                : node.isKeystone
                  ? TREE_CONSTANTS.SPRITES.KEYSTONE_INACTIVE
                  : node.isNotable
                    ? TREE_CONSTANTS.SPRITES.NOTABLE_INACTIVE
                    : TREE_CONSTANTS.SPRITES.NORMAL_INACTIVE;
              const icon = createSprite(
                key,
                node.inactiveIcon ||
                  node.icon ||
                  TREE_CONSTANTS.SPRITES.DEFAULT_ICON,
                nodeX,
                nodeY,
              );

              if (!node.isMastery && !node.isJewelSocket) {
                const group = new Konva.Group({ x: nodeX, y: nodeY });
                // Create relative sprites for the group
                const relativeIcon = createSprite(
                  key,
                  node.inactiveIcon ||
                    node.icon ||
                    TREE_CONSTANTS.SPRITES.DEFAULT_ICON,
                  0,
                  0,
                  undefined,
                  true,
                );
                const relativeFrame = createSprite(
                  TREE_CONSTANTS.SPRITES.FRAME,
                  node.isKeystone
                    ? TREE_CONSTANTS.SPRITES.KEYSTONE_FRAME_UNALLOCATED
                    : node.isNotable
                      ? TREE_CONSTANTS.SPRITES.NOTABLE_FRAME_UNALLOCATED
                      : TREE_CONSTANTS.SPRITES.DEFAULT_FRAME,
                  0,
                  0,
                  undefined,
                  true,
                );
                group.add(relativeIcon, relativeFrame);
                layer.add(group);
                canvas.nodes.set(node.skill, {
                  node: node,
                  icon: relativeIcon,
                  frame: relativeFrame,
                });
              } else {
                layer.add(icon);
              }
            }
          }
        } catch (e) {
          console.error("Error drawing node", node?.skill, e);
        }
      });

      currentIndex = endIndex;
      const progress = (currentIndex / totalNodes) * 100;

      if (onProgress) {
        onProgress(progress, `Drawing nodes: ${currentIndex}/${totalNodes}`);
      }

      if (currentIndex >= totalNodes) {
        layer.batchDraw();
        if (onComplete) onComplete();
        resolve();
      } else {
        requestAnimationFrame(processChunk);
      }
    }

    requestAnimationFrame(processChunk);
  });
}

// Legacy function for backward compatibility
export function drawNodes() {
  return drawNodesProgressive();
}

export function drawBaseRadius() {
  const layer = canvas.mainLayer!,
    jewelRadiusImages = canvas.jewelRadiusImages;
  const jewelRadius = TREE_CONSTANTS.SOCKET.RADIUS;
  const defaultRadius = createSprite(
    TREE_CONSTANTS.SPRITES.JEWEL_RADIUS,
    TREE_CONSTANTS.SOCKET.RADIUS_SPRITES.default.default,
    0,
    0,
  );
  const defaultRadius2 = createSprite(
    TREE_CONSTANTS.SPRITES.JEWEL_RADIUS,
    TREE_CONSTANTS.SOCKET.RADIUS_SPRITES.default.inverse,
    0,
    0,
  );
  defaultRadius.visible(false);
  defaultRadius2.visible(false);
  defaultRadius.opacity(0.5);
  defaultRadius2.opacity(0.5);
  const ratio = defaultRadius.width() / 2;
  defaultRadius.scaleX(jewelRadius / ratio);
  defaultRadius.scaleY(jewelRadius / ratio);
  defaultRadius2.scaleX(jewelRadius / ratio);
  defaultRadius2.scaleY(jewelRadius / ratio);

  jewelRadiusImages.set(TREE_CONSTANTS.SOCKET.DEFAULT, {
    a: defaultRadius,
    b: defaultRadius2,
  });
  layer.add(defaultRadius);
  layer.add(defaultRadius2);
}
