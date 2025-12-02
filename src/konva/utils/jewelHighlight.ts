// src/konva/utils/jewelHighlight.ts
import Konva from 'konva';
import { createSprite } from '$lib/konva/utils/sprites';
import type { Node } from '$lib/types';
import { treeStore } from '$lib/stores/treeStore';
import { get } from 'svelte/store';
import { TREE_CONSTANTS } from '$lib/constants/tree';
import { getHighlighteableNodes } from './nodes';
import { canvas } from '$lib/konva/canvasContext';

export function updateJewelSockets() {
  const jewelImages = canvas.jewelImages,
    layer = canvas.mainLayer!,
    data = canvas.treeData;
  const chosenSocket = get(treeStore).chosenSocket;
  const nodes = data.nodes;
  jewelImages.forEach((img, skill) => {
    const node = Object.values(nodes).find((n: any) => n.skill === skill);
    if (!node?.isJewelSocket) return;

    const isExpansion = !!node.expansionJewel;
    const isSelected = chosenSocket?.skill === skill;

    const type = isSelected
      ? (isExpansion ? TREE_CONSTANTS.SPRITES.CLUSTER_ACTIVE : TREE_CONSTANTS.SPRITES.JEWEL_FRAME_ACTIVE)
      : (isExpansion ? TREE_CONSTANTS.SPRITES.CLUSTER_UNALLOCATED : TREE_CONSTANTS.SPRITES.JEWEL_FRAME_UNALLOCATED);

    if (isSelected) {
      canvas.nodesHighlight.get(skill)?.opacity(0);
    } else {
      canvas.nodesHighlight.get(skill)?.opacity(1);
    }
    const sprite = createSprite(TREE_CONSTANTS.SPRITES.FRAME, type, img.x(), img.y());
    img.crop(sprite.crop());
    img.offsetX(sprite.offsetX());
    img.offsetY(sprite.offsetY());
    img.width(sprite.width());
    img.height(sprite.height());

    changeRadius(chosenSocket)
  });
  setAllocatedNodes(chosenSocket)

  layer.batchDraw();
}

function changeRadius(
  chosenSocket: Node | null
) {
  const jewelRadiusImages = canvas.jewelRadiusImages;
    const radiusImages = jewelRadiusImages.get('default'); // utiliser un store
    if (chosenSocket && radiusImages) {
      const socketX = chosenSocket.x || 0;
      const socketY = chosenSocket.y || 0;
      const radiusImg = radiusImages.a;
      const radiusImg2 = radiusImages.b;
      radiusImg.visible(true);
      radiusImg.x(socketX);
      radiusImg.y(socketY);
      if ('default' !== TREE_CONSTANTS.SOCKET.DEFAULT) { // utiliser un store
        radiusImg2.visible(true);
        radiusImg2.x(socketX);
        radiusImg2.y(socketY);
        startJewelRotation(radiusImg, true);
        startJewelRotation(radiusImg2);
      }
    } else if (radiusImages) {
      radiusImages.a.visible(false);
      radiusImages.b.visible(false);
    }
}

function startJewelRotation(image: Konva.Image, reverse: boolean = false) {
    if (image.getAttr('rotating')) return;

    image.setAttr('rotating', true);

    new Konva.Animation((frame) => {
        if (!frame) return;
        const angle = (frame.time * 360) / 180000;
        image.rotation(reverse ? - (angle % 360) : angle % 360);
    }, image.getLayer()).start();
}

function setAllocatedNodes(
  socket: Node | null,
) {
  const data = canvas.treeData;
  const highlightableNodes = getHighlighteableNodes()
  if (!socket) {
    treeStore.update(state => {
      state.allocated.clear();
      return state;
    });
    return;
  }

  let allocatedNodes = new Map<string, Node>();
  data.socketNodes[socket.skill].forEach(nodeId => {
    allocatedNodes.set(nodeId, data.nodes[nodeId]);
  })
  treeStore.update(state => {
    state.allocated = allocatedNodes
    return state;
  })
  canvas.mainLayer?.batchDraw()
}

function showActive(node: Node)
{
  const {icon, frame} = canvas.nodeImages.get(node.skill)!
  const spriteKey = node.isKeystone ? TREE_CONSTANTS.SPRITES.KEYSTONE_ACTIVE :
          node.isNotable ? TREE_CONSTANTS.SPRITES.NOTABLE_ACTIVE : TREE_CONSTANTS.SPRITES.NORMAL_ACTIVE;
  const activeSprite = createSprite(
    spriteKey,
    node.icon || TREE_CONSTANTS.SPRITES.DEFAULT_ICON,
    icon.x(),
    icon.y()
  );
  icon.image(activeSprite.image());
  icon.crop(activeSprite.crop());
  icon.offsetX(activeSprite.offsetX());
  icon.offsetY(activeSprite.offsetY());
  icon.width(activeSprite.width());
  icon.height(activeSprite.height());

  const activeFrame =  createSprite(
    TREE_CONSTANTS.SPRITES.FRAME,
    node.isKeystone ? TREE_CONSTANTS.SPRITES.KEYSTONE_FRAME_ACTIVE : node.isNotable ? TREE_CONSTANTS.SPRITES.NOTABLE_FRAME_ACTIVE : TREE_CONSTANTS.SPRITES.DEFAULT_FRAME_ACTIVE,
    frame.x(),
    frame.y()
  );
  frame.crop(activeFrame.crop());
  frame.offsetX(activeFrame.offsetX());
  frame.offsetY(activeFrame.offsetY());
  frame.width(activeFrame.width());
  frame.height(activeFrame.height());
}

function showInactive(node: Node)
{
  const {icon, frame} = canvas.nodeImages.get(node.skill)!
  const spriteKey = node.isKeystone ? TREE_CONSTANTS.SPRITES.KEYSTONE_INACTIVE :
          node.isNotable ? TREE_CONSTANTS.SPRITES.NOTABLE_INACTIVE : TREE_CONSTANTS.SPRITES.NORMAL_INACTIVE;
  const inactiveSprite = createSprite(
    spriteKey,
    node.icon || node.inactiveIcon || TREE_CONSTANTS.SPRITES.DEFAULT_ICON,
    icon.x(),
    icon.y()
  );
  icon.image(inactiveSprite.image());
  icon.crop(inactiveSprite.crop());
  icon.offsetX(inactiveSprite.offsetX());
  icon.offsetY(inactiveSprite.offsetY());
  icon.width(inactiveSprite.width());
  icon.height(inactiveSprite.height());

  const inactiveFrame =  createSprite(
    TREE_CONSTANTS.SPRITES.FRAME,
    node.isKeystone ? TREE_CONSTANTS.SPRITES.KEYSTONE_FRAME_UNALLOCATED : node.isNotable ? TREE_CONSTANTS.SPRITES.NOTABLE_FRAME_UNALLOCATED : TREE_CONSTANTS.SPRITES.DEFAULT_FRAME,
    frame.x(),
    frame.y()
  );
  frame.crop(inactiveFrame.crop());
  frame.offsetX(inactiveFrame.offsetX());
  frame.offsetY(inactiveFrame.offsetY());
  frame.width(inactiveFrame.width());
  frame.height(inactiveFrame.height());
}

export function updateAllocatedDisplay() {
  const allocatedNodes = get(treeStore).allocated;
  const highlightableNodes = getHighlighteableNodes();

  for (const [nodeId, node] of allocatedNodes) {
    showActive(node);
  }

  for (const [nodeId, node] of highlightableNodes) {
    if (!allocatedNodes.has(nodeId)) {
      showInactive(node);
    }
  }
}