import translationsJson from "$lib/data/translation.json" with { type: "json" };
import type { Translation } from "$lib/types";

export const translations: Record<string, Translation[]> = JSON.parse(
	JSON.stringify(translationsJson),
);

export function getStatTranslations(key: string): Translation[] | undefined {
	return translations[key];
}
