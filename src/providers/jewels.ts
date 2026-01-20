// src/providers/jewels.ts

import { jewelTypes } from "$lib/constants/timeless";
import { perfMonitor } from "$lib/utils/performanceMonitor";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

// Clear typing for data in each file
export interface JewelEntry {
  r: Record<string, number[]>;
  a: Record<string, number[]>;
}

// In-memory cache for jewel data
export const cache = new Map<string, Record<number, JewelEntry>>();

// Svelte store to react to loading (optional but practical)
export const loadingJewels: Writable<Set<string>> = writable(new Set());
export const loadedJewels: Writable<Set<string>> = writable(new Set());

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

/**
 * Load a single jewel data file by jewel ID (e.g., "karui", "maraketh", etc.)
 * Uses cache to avoid reloading already loaded jewels.
 * @throws Error if the file fails to load
 */
export async function loadJewel(jewelId: string): Promise<void> {
  // Check if already loaded
  if (cache.has(jewelId)) {
    return;
  }

  const jewel = jewelTypes.find((j) => j.name === jewelId);
  if (!jewel) {
    throw new Error(`Unknown jewel type: ${jewelId}`);
  }

  const fileName = jewel.label.replace(/\s+/g, "") + ".jsonl.gz";

  if (!jewelFileNames.includes(fileName)) {
    throw new Error(`File not found: ${fileName}`);
  }

  const url = `/src/data/jewels/${fileName}`;

  loadingJewels.update((s) => new Set(s).add(jewelId));

  try {
    perfMonitor.mark(jewel.label + ' preload-start');
    const text = await fetchText(url);
    perfMonitor.mark(jewel.label + ' preload-end');
    perfMonitor.measure(
      jewel.label + ' preload',
      jewel.label + ' preload-start',
      jewel.label + ' preload-end',
    );

    // JSONL: each line is a JSON object
    const lines = text.trim().split("\n").filter(Boolean);
    const data: Record<number, JewelEntry> = {};
    let i = jewel.min;
    const step = jewelId === "eternal" ? 20 : 1;
    for (const line of lines) {
      const entry = JSON.parse(line) as JewelEntry;
      data[i] = entry;
      i += step;
    }

    cache.set(jewelId, data);
    loadedJewels.update((s) => new Set(s).add(jewelId));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to load ${fileName}: ${message}`);
  } finally {
    loadingJewels.update((s) => {
      const next = new Set(s);
      next.delete(jewelId);
      return next;
    });
  }
}

// Synchronous retrieval (returns undefined if not yet loaded)
export function getJewelData(
  jewelId: string,
): Record<number, JewelEntry> | undefined {
  return cache.get(jewelId);
}
