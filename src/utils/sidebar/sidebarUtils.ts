import type { Stat, Translation } from "$lib/types";

export function parseKey(key: string): { statId: number; value: number }[] {
  const parts = key.split("-");
  const statsStr = parts[1]; // enlever le }
  const stats = JSON.parse(statsStr);
  return Object.entries(stats).map(([statId, value]) => {
    return { statId: parseInt(statId), value: value as number };
  });
}

export function getTranslation(
  statId: number,
  value: number,
  translation: Record<string, Translation[]>,
): string {
  const trans = translation[statId.toString()];
  if (!trans) return `Unknown stat ${statId}`;
  let entry;
  if (value > 0) {
    entry = trans.find((t) => t.from !== undefined && t.from > 0) || trans[0];
  } else if (value < 0) {
    entry =
      trans.find((t) => t.to !== undefined && t.to < 0) || trans[1] || trans[0];
  } else {
    entry = trans[0];
  }
  if (!entry) return `No translation for ${statId}`;
  let str = entry.translation;
  str = str.replace(new RegExp(`\\{0\\}`, "g"), value.toString());
  return str;
}

export function filterStats(
  query: string,
  statOptions: Stat[],
  selectedStats: Stat[],
): Stat[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return statOptions;
  }
  return statOptions
    .filter((stat) => stat.label.toLowerCase().includes(lowerQuery))
    .filter((stat) => !selectedStats.some((s) => s.label === stat.label));
}
