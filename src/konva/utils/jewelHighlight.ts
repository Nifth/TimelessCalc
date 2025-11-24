// src/konva/utils/jewelHighlight.ts
import Konva from 'konva';
import { createSprite } from '$lib/konva/utils/sprites';
import type { Node } from '$lib/types';
import { treeStore } from '$lib/stores/treeStore';
import { get } from 'svelte/store';

export function updateJewelSockets(
  jewelImages: Map<number, Konva.Image>,
  jewelRadiusImages: Map<string, {a: Konva.Image, b: Konva.Image}>,
  layer: Konva.Layer,
  nodes: Record<string, Node>
) {
  const chosenSocket = get(treeStore).chosenSocket;
  jewelImages.forEach((img, skill) => {
    const node = Object.values(nodes).find((n: any) => n.skill === skill);
    if (!node?.isJewelSocket) return;

    const isExpansion = !!node.expansionJewel;
    const isSelected = chosenSocket?.skill === skill;

    const type = isSelected
      ? (isExpansion ? 'JewelSocketAltActive' : 'JewelFrameAllocated')
      : (isExpansion ? 'JewelSocketAltNormal' : 'JewelFrameUnallocated');

    const sprite = createSprite('frame', type, img.x(), img.y());
    img.crop(sprite.crop());
    img.offsetX(sprite.offsetX());
    img.offsetY(sprite.offsetY());
    img.width(sprite.width());
    img.height(sprite.height());

    // split en 2 fonction + changer le crop du radius en fonction du jewel type
    const radiusImages = jewelRadiusImages.get('default'); // utiliser un store
    if (chosenSocket && radiusImages) {
      const socketX = chosenSocket.x || 0;
      const socketY = chosenSocket.y || 0;
      const radiusImg = radiusImages.a;
      const radiusImg2 = radiusImages.b;
      radiusImg.visible(true);
      radiusImg.x(socketX);
      radiusImg.y(socketY);
      if ('default' !== 'default') { // utiliser un store
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
  });

  layer.batchDraw();
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