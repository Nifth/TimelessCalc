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

function createSprite(spriteKey: string, config: SpriteConfig): Konva.Image {
  return new Konva.Image({
    image: spriteCache[spriteKey],
    ...config
  });
}

function preloadSprites(sprites: Record<string, Record<string, Sprite>>) {
    Object.entries(sprites).forEach(([type, spriteConfig]) => {
        console.log('Preload sprites for ' + type)
        Object.entries(spriteConfig).slice(0,1).forEach(([zoom, sprite]) => {
            preloadSprite(sprite.filename, type)
        })
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
    
    return spriteCache[spriteKey]
}

// Export pour utilisation dans d'autres fichiers
export { createSprite, preloadSprites };
export type { SpriteConfig };