import type { Sprite } from "$lib/types";
import { URLS } from "$lib/constants/urls";
import { canvas } from "../canvasContext";

export async function preloadSprites(
	sprites: Record<string, Record<string, Sprite>>,
): Promise<void> {
	const promises: Promise<HTMLImageElement>[] = [];

	for (const [type, config] of Object.entries(sprites)) {
		const neededSprite = config[Object.keys(config).at(-1)!];
		if (!neededSprite) continue;

		canvas.spriteConfig.set(type, neededSprite);

		const url = neededSprite.filename.replace(
			URLS.POE_CDN_PASSIVE_SKILL,
			"assets/",
		);

		if (!canvas.spriteCache.has(type)) {
			const imgPromise = new Promise<HTMLImageElement>((resolve, reject) => {
				const img = new Image();
				img.src = url;
				img.onload = () => {
					resolve(img);
				};
				img.onerror = (e) => {
					console.error("Image load error:", type, e);
					reject(e);
				};
			});
			promises.push(imgPromise);

			canvas.spriteCache.set(type, imgPromise as unknown as HTMLImageElement);
		}
	}

	const images = await Promise.all(promises);

	let index = 0;
	for (const [type] of Object.entries(sprites)) {
		if (canvas.spriteCache.has(type)) {
			canvas.spriteCache.set(type, images[index++]);
		}
	}
}

export function getSprite(
	spriteKey: string,
	part: string,
): {
	image: HTMLImageElement;
	crop: { x: number; y: number; width: number; height: number };
} {
	const sprite = canvas.spriteConfig.get(spriteKey);
	if (!sprite) {
		throw new Error(`Sprite not found: ${spriteKey}`);
	}

	const coords = sprite.coords[part];
	if (!coords) {
		throw new Error(`Sprite part not found: ${part} in ${spriteKey}`);
	}

	const image = canvas.spriteCache.get(spriteKey);
	if (!image) {
		throw new Error(`Sprite image not loaded: ${spriteKey}`);
	}

	return {
		image,
		crop: {
			x: coords.x,
			y: coords.y,
			width: coords.w,
			height: coords.h,
		},
	};
}

export function drawSprite(
	context: CanvasRenderingContext2D,
	spriteKey: string,
	part: string,
	x: number,
	y: number,
	scale: number = 2,
	mirror: boolean = false,
): void {
	const { image, crop } = getSprite(spriteKey, part);
	const width = crop.width * scale;
	const height = crop.height * scale;

	context.save();
	context.translate(x, y);

	if (mirror) {
		context.scale(-1, 1);
	}

	context.drawImage(
		image,
		crop.x,
		crop.y,
		crop.width,
		crop.height,
		-width / 2,
		-height / 2,
		width,
		height,
	);

	context.restore();
}
