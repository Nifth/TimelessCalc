// src/lib/jewelCache.ts

import { jewelTypes } from "$lib/constants/timeless";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

// Typage clair de ce qu’on trouve dans chaque fichier
export interface JewelEntry {
  r: Record<string, number[]>;
  a: Record<string, number[]>;
}

// Cache global
const cache = new Map<string, Record<number, JewelEntry>>();

// Store Svelte pour réagir au chargement (optionnel mais pratique)
export const loadingJewels: Writable<Set<string>> = writable(new Set());
export const loadedJewels: Writable<Set<string>> = writable(new Set());

// Une seule promesse globale pour éviter les doublons
let globalPreloadPromise: Promise<void> | null = null;

// Importer les fichiers comme URLs
const jewelFiles = import.meta.glob("/src/data/jewels/*.jsonl.gz", {
  as: "url",
});

// Fonction pour charger un fichier compressé
function fetchCompressed(url: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(new Uint8Array(xhr.response));
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send();
  });
}

// todo: fix le militant faith, il récup tout le temps la meme merce
export async function preloadJewels(): Promise<void> {
  if (globalPreloadPromise) return globalPreloadPromise;

  globalPreloadPromise = (async () => {
    const loadPromises = jewelTypes.map(async (jewel) => {
      const key = jewel.name;
      if (cache.has(key)) return;

      const fileName = jewel.label.replace(/\s+/g, "") + ".jsonl.gz";
      const filePath = `/src/data/jewels/${fileName}`;
      const url = await jewelFiles[filePath]();

      if (!url) {
        console.error(`Fichier non trouvé: ${filePath}`);
        return;
      }

      loadingJewels.update((s) => new Set(s).add(key));

      try {
        const compressed = await fetchCompressed(url);
        const text = new TextDecoder().decode(compressed);

        // JSONL → chaque ligne est un objet JSON
        const lines = text.trim().split("\n").filter(Boolean);
        const data: Record<number, JewelEntry> = {};
        let i = jewel.min;
        const step = key === "eternal" ? 20 : 1;
        for (const line of lines) {
          const entry = JSON.parse(line) as JewelEntry;
          data[i] = entry;
          i += step;
        }
        cache.set(key, data);
        loadedJewels.update((s) => new Set(s).add(key));
      } catch (err) {
        console.error(`[JewelCache] Échec chargement ${fileName}:`, err);
      } finally {
        loadingJewels.update((s) => {
          const next = new Set(s);
          next.delete(key);
          return next;
        });
      }
    });

    await Promise.all(loadPromises);
  })();

  return globalPreloadPromise;
}

// Récupération synchrone (renvoie undefined si pas encore chargé)
export function getJewelData(
  jewelId: string,
): Record<number, JewelEntry> | undefined {
  return cache.get(jewelId);
}
