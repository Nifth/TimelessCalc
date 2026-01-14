import type { League } from "$lib/types";

const cache = new Map<string, League[]>();
let fetchPromise: Promise<League[]> | null = null;

export async function fetchLeagues(): Promise<League[]> {
  if (cache.has("all")) return cache.get("all")!;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const response = await fetch("https://api.poe.watch/leagues");
    const allLeagues: League[] = await response.json();

    const filtered = allLeagues.filter((l) => l.name !== "Solo Self-Found");

    cache.set("all", filtered);
    return filtered;
  })();

  return fetchPromise;
}

export function getCachedLeagues(): League[] | undefined {
  return cache.get("all");
}
