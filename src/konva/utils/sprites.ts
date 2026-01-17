import Konva from "konva";
import type { Sprite } from "$lib/types";
import type { HalfDirectionValue } from "$lib/constants/tree";
import { TREE_CONSTANTS } from "$lib/constants/tree";

const spriteCache: { [key: string]: HTMLImageElement } = {};
const spriteConfig: Record<string, Sprite> = {};

function createSprite(
  spriteKey: string,
  part: string,
  nodeX: number,
  nodeY: number,
  move?: HalfDirectionValue,
  relative?: boolean,
): Konva.Image {
  const spriteConfig = getSpriteConfig(spriteKey, part, nodeX, nodeY, relative);
  if (move === TREE_CONSTANTS.SPRITES.HALF_UP && spriteConfig.y) {
    spriteConfig.y -= spriteConfig.height!;
  } else if (
    move === TREE_CONSTANTS.SPRITES.HALF_DOWN &&
    spriteConfig.y &&
    spriteConfig.x
  ) {
    spriteConfig.y += spriteConfig.height!;
    spriteConfig.x += spriteConfig.width! * 2;
    spriteConfig.offsetX = spriteConfig.width! * 1.5;
    spriteConfig.scaleY = -2;
  }

  return new Konva.Image({
    ...spriteConfig,
    image: spriteCache[spriteKey],
    cornerRadius: 900,
  });
}

function getSpriteConfig(
  spriteKey: string,
  part: string,
  nodeX: number,
  nodeY: number,
  relative?: boolean,
): Konva.ImageConfig {
  const sprite = spriteConfig[spriteKey];
  if (!sprite) {
    throw new Error(`Sprite not found for key: ${spriteKey}`);
  }
  const crop = sprite.coords[part];
  if (!crop) {
    throw new Error(`Crop part not found: ${part} in sprite: ${spriteKey}`);
  }

  return {
    image: undefined,
    crop: {
      x: crop.x,
      y: crop.y,
      width: crop.w,
      height: crop.h,
    },
    scaleX: 2,
    scaleY: 2,
    width: crop.w,
    height: crop.h,
    offsetX: crop.w / 2,
    offsetY: crop.h / 2,
    x: relative ? 0 : nodeX,
    y: relative ? 0 : nodeY,
  };
}

function preloadSprites(sprites: Record<string, Record<string, Sprite>>) {
  const promises = Object.entries(sprites).map(([type, config]) => {
    const neededSprite =
      config[Object.keys(config)[Object.keys(config).length - 1]];
    if (!neededSprite) {
      throw new Error(`No sprites found for type: ${type}`);
    }
    spriteConfig[type] = neededSprite;
    return preloadSprite(neededSprite.filename, type);
  });
  return Promise.all(promises);
}

function preloadSprite(spriteUrl: string, spriteKey: string): Promise<HTMLImageElement> {
  if (!spriteCache[spriteKey]) {
    const img = new Image();
    const url = spriteUrl.replace(
      "https://web.poecdn.com/image/passive-skill/",
      "assets/",
    );
    img.src = url;

    spriteCache[spriteKey] = img;
  }

  return new Promise((resolve, reject) => {
    const img = spriteCache[spriteKey];
    if (img.complete) {
      resolve(img);
    } else {
      img.onload = () => resolve(img);
      img.onerror = reject;
    }
  });
}

export { createSprite, preloadSprites };
