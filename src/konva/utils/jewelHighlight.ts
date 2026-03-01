// src/konva/utils/jewelHighlight.ts
import Konva from "konva";
import { createSprite } from "$lib/konva/utils/sprites";
import type { Node } from "$lib/types";
import { treeStore } from "$lib/stores/treeStore";
import { get } from "svelte/store";
import { TREE_CONSTANTS, type JewelCode } from "$lib/constants/tree";
import { getHighlightableNodes } from "./nodes";
import { canvas } from "$lib/konva/canvasContext";
import { searchStore } from "$lib/stores/searchStore";
import { resetFull } from "$lib/utils/search/resetStore";

// Global animation registry for proper cleanup
const jewelAnimations: Map<string, Konva.Animation> = new Map();

// Cache to avoid recreating animations unnecessarily
let lastSocketSkill: number | null = null;
let lastJewelType: string | null = null;

export function updateJewelSockets() {
  const chosenSocket = get(treeStore).chosenSocket;

  resetFull();

  const socketSelectionChanged = updateSocketVisualSelection();

  changeRadius(chosenSocket);
  changeKeystone(chosenSocket);

  const allocationChanged = setAllocatedNodes(chosenSocket);

  if (socketSelectionChanged || allocationChanged) {
    canvas.mainLayer?.batchDraw();
  }
}

// Only updates the visual selection state of sockets without allocating nodes
export function updateSocketVisualSelection(): boolean {
  const jewelImages = canvas.jewelImages,
    data = canvas.treeData;
  const chosenSocket = get(treeStore).chosenSocket;
  const nodes = data.nodes;
  let needsRedraw = false;

  jewelImages.forEach((img, skill) => {
    const node = Object.values(nodes).find((n: Node) => n.skill === skill);
    if (!node?.isJewelSocket) return;

    const isExpansion = !!node.expansionJewel;
    const isSelected = chosenSocket?.skill === skill;

    // Check if image needs to be updated
    const wasSelected = canvas.nodesHighlight.get(skill)?.opacity() === 0;
    if (isSelected !== wasSelected) {
      const type = isSelected
        ? isExpansion
          ? TREE_CONSTANTS.SPRITES.CLUSTER_ACTIVE
          : TREE_CONSTANTS.SPRITES.JEWEL_FRAME_ACTIVE
        : isExpansion
          ? TREE_CONSTANTS.SPRITES.CLUSTER_UNALLOCATED
          : TREE_CONSTANTS.SPRITES.JEWEL_FRAME_UNALLOCATED;

      if (isSelected) {
        canvas.nodesHighlight.get(skill)?.opacity(0);
      } else {
        canvas.nodesHighlight.get(skill)?.opacity(1);
      }

      const sprite = createSprite(
        TREE_CONSTANTS.SPRITES.FRAME,
        type,
        img.x(),
        img.y(),
      );
      img.crop(sprite.crop());
      img.offsetX(sprite.offsetX());
      img.offsetY(sprite.offsetY());
      img.width(sprite.width());
      img.height(sprite.height());
      needsRedraw = true;
    }
  });

  return needsRedraw;
}

export function changeRadius(chosenSocket: Node | null) {
  const jewelRadiusImages = canvas.jewelRadiusImages;
  const radiusImages = jewelRadiusImages.get("default"); // use a store
  const currentJewelType = get(searchStore).jewelType?.name as
    | JewelCode
    | undefined;

  // Check if we need to cleanup animations (socket or jewelType changed)
  const socketChanged = chosenSocket?.skill !== lastSocketSkill;
  const jewelTypeChanged = currentJewelType !== lastJewelType;

  if (socketChanged || jewelTypeChanged) {
    stopAllJewelAnimations();
    lastSocketSkill = chosenSocket?.skill || null;
    lastJewelType = currentJewelType || null;
  }

  if (chosenSocket && radiusImages) {
    const socketX = chosenSocket.x || 0;
    const socketY = chosenSocket.y || 0;
    const radiusImg = radiusImages.a;
    const radiusImg2 = radiusImages.b;
    radiusImg.visible(true);
    radiusImg.x(socketX);
    radiusImg.y(socketY);
    if (currentJewelType) {
      const sprite = createSprite(
        TREE_CONSTANTS.SPRITES.JEWEL_RADIUS,
        TREE_CONSTANTS.SOCKET.RADIUS_SPRITES[currentJewelType].default,
        0,
        0,
      );
      radiusImg.crop(sprite.crop());
    }
    if (currentJewelType) {
      // use a store
      radiusImg2.visible(true);
      radiusImg2.x(socketX);
      radiusImg2.y(socketY);
      const sprite2 = createSprite(
        TREE_CONSTANTS.SPRITES.JEWEL_RADIUS,
        TREE_CONSTANTS.SOCKET.RADIUS_SPRITES[currentJewelType].inverse,
        0,
        0,
      );
      radiusImg2.crop(sprite2.crop());

      // Start animations only if they're not already running
      if (!radiusImg.getAttr("rotating")) {
        startJewelRotation(radiusImg, true);
      }
      if (!radiusImg2.getAttr("rotating")) {
        startJewelRotation(radiusImg2);
      }
    } else {
      radiusImg2.visible(false);
    }
  } else if (radiusImages) {
    radiusImages.a.visible(false);
    radiusImages.b.visible(false);
  }
}

function startJewelRotation(image: Konva.Image, reverse: boolean = false) {
  if (image.getAttr("rotating")) return;

  const animKey = `${reverse ? "reverse" : "forward"}_${image.id()}`;

  image.setAttr("rotating", true);

  const anim = new Konva.Animation((frame) => {
    if (!frame) return;
    const angle = (frame.time * 360) / 180000;
    image.rotation(reverse ? -(angle % 360) : angle % 360);
  }, image.getLayer());

  jewelAnimations.set(animKey, anim);
  anim.start();
}

// Cleanup function to stop all jewel animations
export function stopAllJewelAnimations() {
  jewelAnimations.forEach((anim) => {
    anim.stop();
  });
  jewelAnimations.clear();

  // Reset rotating attributes on all radius images
  const radiusImages = canvas.jewelRadiusImages.get("default");
  if (radiusImages) {
    radiusImages.a.setAttr("rotating", false);
    radiusImages.b.setAttr("rotating", false);
  }
}

function setAllocatedNodes(socket: Node | null): boolean {
  const data = canvas.treeData;
  if (!socket) {
    const currentAllocated = get(treeStore).allocated;
    if (currentAllocated.size > 0) {
      treeStore.update((state) => {
        state.allocated.clear();
        return state;
      });
      return updateAllocatedDisplay();
    }
    return false;
  }

  const currentAllocated = get(treeStore).allocated;
  const allocatedNodes = new Map<string, Node>();
  data.socketNodes[socket.skill].forEach((nodeId) => {
    allocatedNodes.set(nodeId, data.nodes[nodeId]);
  });

  // Only update if allocated nodes actually changed
  if (
    currentAllocated.size !== allocatedNodes.size ||
    !Array.from(allocatedNodes.keys()).every((key) => currentAllocated.has(key))
  ) {
    treeStore.update((state) => {
      state.allocated = allocatedNodes;
      return state;
    });
    return updateAllocatedDisplay();
  }
  return false;
}

function getSpriteKeys(
  node: Node,
  isActive: boolean,
): {
  iconKey: string;
  frameKey: string;
} {
  if (isActive) {
    return {
      iconKey: node.isKeystone
        ? TREE_CONSTANTS.SPRITES.KEYSTONE_ACTIVE
        : node.isNotable
          ? TREE_CONSTANTS.SPRITES.NOTABLE_ACTIVE
          : TREE_CONSTANTS.SPRITES.NORMAL_ACTIVE,
      frameKey: node.isKeystone
        ? TREE_CONSTANTS.SPRITES.KEYSTONE_FRAME_ACTIVE
        : node.isNotable
          ? TREE_CONSTANTS.SPRITES.NOTABLE_FRAME_ACTIVE
          : TREE_CONSTANTS.SPRITES.DEFAULT_FRAME_ACTIVE,
    };
  } else {
    return {
      iconKey: node.isKeystone
        ? TREE_CONSTANTS.SPRITES.KEYSTONE_INACTIVE
        : node.isNotable
          ? TREE_CONSTANTS.SPRITES.NOTABLE_INACTIVE
          : TREE_CONSTANTS.SPRITES.NORMAL_INACTIVE,
      frameKey: node.isKeystone
        ? TREE_CONSTANTS.SPRITES.KEYSTONE_FRAME_UNALLOCATED
        : node.isNotable
          ? TREE_CONSTANTS.SPRITES.NOTABLE_FRAME_UNALLOCATED
          : TREE_CONSTANTS.SPRITES.DEFAULT_FRAME,
    };
  }
}

function updateNodeSprites(node: Node, isActive: boolean): void {
  if (!canvas.nodes.has(node.skill)) return;

  const { icon, frame } = canvas.nodes.get(node.skill)!;
  const { iconKey, frameKey } = getSpriteKeys(node, isActive);
  const iconSource =
    node.icon ||
    (isActive ? undefined : node.inactiveIcon) ||
    TREE_CONSTANTS.SPRITES.DEFAULT_ICON;

  const iconSprite = createSprite(iconKey, iconSource, icon.x(), icon.y());
  icon.image(iconSprite.image());
  icon.crop(iconSprite.crop());
  icon.offsetX(iconSprite.offsetX());
  icon.offsetY(iconSprite.offsetY());
  icon.width(iconSprite.width());
  icon.height(iconSprite.height());

  const frameSprite = createSprite(
    TREE_CONSTANTS.SPRITES.FRAME,
    frameKey,
    frame.x(),
    frame.y(),
  );
  frame.crop(frameSprite.crop());
  frame.offsetX(frameSprite.offsetX());
  frame.offsetY(frameSprite.offsetY());
  frame.width(frameSprite.width());
  frame.height(frameSprite.height());
}

function showActive(node: Node) {
  updateNodeSprites(node, true);
}

function showInactive(node: Node) {
  updateNodeSprites(node, false);
}

export function updateAllocatedDisplay(): boolean {
  const allocatedNodes = get(treeStore).allocated;
  const highlightableNodes = getHighlightableNodes();
  let needsRedraw = false;

  for (const [_nodeId, node] of allocatedNodes) {
    const { iconKey: currentIconKey, frameKey: currentFrameKey } = getSpriteKeys(
      node,
      true,
    );
    const { iconKey: newIconKey, frameKey: newFrameKey } = getSpriteKeys(
      node,
      false,
    );

    if (
      currentIconKey !== newIconKey ||
      currentFrameKey !== newFrameKey
    ) {
      showActive(node);
      needsRedraw = true;
    }
  }

  for (const [nodeId, node] of highlightableNodes) {
    if (!allocatedNodes.has(nodeId)) {
      const { iconKey: currentIconKey, frameKey: currentFrameKey } =
        getSpriteKeys(node, false);
      const { iconKey: newIconKey, frameKey: newFrameKey } = getSpriteKeys(
        node,
        true,
      );

      if (
        currentIconKey !== newIconKey ||
        currentFrameKey !== newFrameKey
      ) {
        showInactive(node);
        needsRedraw = true;
      }
    }
  }

  return needsRedraw;
}

export function changeKeystone(chosenSocket: Node | null) {
  const conqueror = get(searchStore).conqueror;
  canvas.nodes.forEach((n) => {
    n.node.conqueredName = null;
  });
  if (!chosenSocket) return;
  const treeData = canvas.treeData;
  const socketNodes = treeData.socketNodes[chosenSocket.skill];
  const keystones = socketNodes.filter((n) => {
    const node = treeData.nodes[n];
    return node.isKeystone;
  });
  keystones.forEach((k) => {
    const keystoneNode = canvas.nodes.get(Number(k));
    if (conqueror && conqueror.label !== "Any") {
      keystoneNode!.node.conqueredName = conqueror!.keystone;
      keystoneNode!.node.timelessStats = [];
      keystoneNode!.node.timelessStatKeys = [];
      keystoneNode!.node.timelessStatValues = [];
    } else {
      keystoneNode!.node.conqueredName = null;
      keystoneNode!.node.timelessStatKeys = undefined;
      keystoneNode!.node.timelessStatValues = undefined;
    }
  });
}

export function resetHighlights() {
  clearHighlights();
  const chosenSocket = get(treeStore).chosenSocket;
  if (chosenSocket) {
    const socketNodeIds = canvas.treeData.socketNodes[chosenSocket.skill];
    for (const nodeId of socketNodeIds) {
      const node = canvas.treeData.nodes[nodeId];
      node.timelessStats = undefined;
      node.timelessStatKeys = undefined;
      node.timelessStatValues = undefined;
    }
  }
}

export function clearHighlights() {
  canvas.highlightLayer?.destroyChildren();
  canvas.highlightLayer?.batchDraw();
}
