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
// Key format: "jewelId-socketId" (e.g., "vaal-2491", "vaal-6230")
export const cache = new Map<string, Record<number, JewelEntry>>();

// Svelte store to react to loading (optional but practical)
export const loadingJewels: Writable<Set<string>> = writable(new Set());
export const loadedJewels: Writable<Set<string>> = writable(new Set());

// Function to load a file (browser automatically decompresses .gz files)
async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

/**
 * Load a single jewel data file by jewel ID and socket
 * Uses cache to avoid reloading already loaded jewels.
 * @param jewelId - jewel type name (e.g., "karui", "maraketh", etc.)
 * @param socketSkill - socket ID (e.g., "2491", "6230", etc.)
 * @throws Error if the file fails to load
 */
export async function loadJewel(
  jewelId: string,
  socketSkill: string,
): Promise<void> {
  const cacheKey = `${jewelId}-${socketSkill}`;

  if (cache.has(cacheKey)) {
    return;
  }

  const jewel = jewelTypes.find((j) => j.name === jewelId);
  if (!jewel) {
    throw new Error(`Unknown jewel type: ${jewelId}`);
  }

  const fileName = `${jewel.label.replace(/\s+/g, "")}-${socketSkill}.jsonl.gz`;
  const url = `/src/data/jewels/${fileName}`;

  loadingJewels.update((s) => new Set(s).add(jewelId));

  try {
    perfMonitor.mark(jewel.label + "-" + socketSkill + " preload-start");
    const text = await fetchText(url);
    perfMonitor.mark(jewel.label + "-" + socketSkill + " preload-end");
    perfMonitor.measure(
      jewel.label + "-" + socketSkill + " preload",
      jewel.label + "-" + socketSkill + " preload-start",
      jewel.label + "-" + socketSkill + " preload-end",
    );

    const lines = text.trim().split("\n").filter(Boolean);
    const data: Record<number, JewelEntry> = {};
    let i = jewel.min;
    const step = jewelId === "eternal" ? 20 : 1;
    for (const line of lines) {
      const entry = JSON.parse(line) as JewelEntry;
      data[i] = entry;
      i += step;
    }

    cache.set(cacheKey, data);
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

export function getJewelData(
  jewelId: string,
  socketSkill: string,
): Record<number, JewelEntry> | undefined {
  const cacheKey = `${jewelId}-${socketSkill}`;
  return cache.get(cacheKey);
}
