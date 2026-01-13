// src/lib/jewelCache.ts

import { jewelTypes } from "$lib/constants/timeless";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

// Typage clair de ce qu’on trouve dans chaque fichier
export interface JewelEntry {
  r: Record<string, number[]>;
  a: Record<string, number[]>;
}

// Global cache
const cache = new Map<string, Record<number, JewelEntry>>();

// Svelte store to react to loading (optional but practical)
export const loadingJewels: Writable<Set<string>> = writable(new Set());
export const loadedJewels: Writable<Set<string>> = writable(new Set());

// Single global promise to avoid duplicates
let globalPreloadPromise: Promise<void> | null = null;

// Data file configuration
const jewelFileNames = [
  "ElegantHubris.jsonl.gz",
  "MilitantFaith.jsonl.gz",
  "BrutalRestraint.jsonl.gz",
  "LethalPride.jsonl.gz",
  "GloriousVanity.jsonl.gz",
];

// Function to load a file (browser automatically decompresses .gz files)
async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

// todo: fix the militant faith, it keeps getting the same merchandise
export async function preloadJewels(): Promise<void> {
  if (globalPreloadPromise) return globalPreloadPromise;

  globalPreloadPromise = (async () => {
    const loadPromises = jewelTypes.map(async (jewel) => {
      const key = jewel.name;
      if (cache.has(key)) return;

      const fileName = jewel.label.replace(/\s+/g, "") + ".jsonl.gz";

      if (!jewelFileNames.includes(fileName)) {
        console.error(`File not found: ${fileName}`);
        return;
      }

      const url = `/src/data/jewels/${fileName}`;

      loadingJewels.update((s) => new Set(s).add(key));

      try {
        const text = await fetchText(url);

        // JSONL → each line is a JSON object
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
        console.error(`[JewelCache] Failed loading ${fileName}:`, err);
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

// Synchronous retrieval (returns undefined if not yet loaded)
export function getJewelData(
  jewelId: string,
): Record<number, JewelEntry> | undefined {
  return cache.get(jewelId);
}
