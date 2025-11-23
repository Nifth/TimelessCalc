import Konva from "konva";
import type { CropConfig, Sprite } from "./types";



interface SpriteConfig {
  x: number;
  y: number;
  crop: CropConfig;
  // Autres propriétés Konva optionnelles
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  opacity?: number;
}

// Cache typé
const spriteCache: { [key: string]: HTMLImageElement } = {};
let spriteConfig: Record<string, Sprite> = {};

function createSprite(
  spriteKey: string,
  part: string,
  nodeX: number,
  nodeY: number,
  move?: 'halfUp' | 'halfDown'
): Konva.Image {
  const spriteConfig = getSpriteConfig(spriteKey, part, nodeX, nodeY);
  if (move === 'halfUp' && spriteConfig.y) {
    spriteConfig.y -= spriteConfig.height!;
  } else if (move === 'halfDown' && spriteConfig.y && spriteConfig.x) {
    spriteConfig.y += spriteConfig.height!;
    spriteConfig.x += spriteConfig.width! * 2;
    spriteConfig.offsetX = spriteConfig.width! * 1.5
    spriteConfig.scaleY = -2;
  }

  return new Konva.Image({
    ...spriteConfig,
    image: spriteCache[spriteKey],
    cornerRadius: 900
  });
}

function getSpriteConfig(
  spriteKey: string,
  part: string,
  nodeX: number,
  nodeY: number
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
    x: nodeX,
    y: nodeY,
  };
}

function preloadSprites(sprites: Record<string, Record<string, Sprite>>) {
    Object.entries(sprites).forEach(([type, config]) => {
      const neededSprite = config[Object.keys(config)[Object.keys(config).length - 1]];
      if (!neededSprite) {
        throw new Error(`No sprites found for type: ${type}`);
      }
      spriteConfig[type] = neededSprite;
      console.log('Preload sprites for ' + type)
      preloadSprite(neededSprite.filename, type)
    })
}

function preloadSprite(spriteUrl: string, spriteKey: string): HTMLImageElement {
    if (!spriteCache[spriteKey]) {
        const img = new Image();
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        img.crossOrigin = 'Anonymous';
        img.src = proxyUrl + spriteUrl;

        spriteCache[spriteKey] = img;
    }
    
    return spriteCache[spriteKey];
}

// Export pour utilisation dans d'autres fichiers
export { createSprite, preloadSprites };
export type { SpriteConfig };