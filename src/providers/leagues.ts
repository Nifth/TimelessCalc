import type { League } from "$lib/types";

const cache = new Map<string, League[]>();
let fetchPromise: Promise<League[]> | null = null;

const EXCLUDED_LEAGUE_KEYWORDS = ["Hardcore", "HC ", "SSF", "Solo Self-Found", "Ruthless", "Standard"];

interface PoeApiLeague {
    id: string;
    name: string;
}

let defaultLeagueCache: string | null = null;
let defaultLeaguePromise: Promise<string> | null = null;

export async function fetchDefaultLeague(): Promise<string> {
    if (defaultLeagueCache) return defaultLeagueCache;
    if (defaultLeaguePromise) return defaultLeaguePromise;

    defaultLeaguePromise = (async () => {
        try {
            const response = await fetch("https://api.pathofexile.com/leagues?type=main&compact=1");
            const leagues: PoeApiLeague[] = await response.json();

            const challengeLeague = leagues.find((league) =>
                !EXCLUDED_LEAGUE_KEYWORDS.some((keyword) => league.name.includes(keyword))
            );

            defaultLeagueCache = challengeLeague?.name ?? "Standard";
            return defaultLeagueCache;
        } catch {
            defaultLeagueCache = "Standard";
            return defaultLeagueCache;
        }
    })();

    return defaultLeaguePromise;
}

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
