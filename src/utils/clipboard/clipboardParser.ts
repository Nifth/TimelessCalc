import { jewelTypes, conquerors } from "$lib/constants/timeless";
import type { ParsedClipboard, JewelType } from "$lib/types";
import { seedTextFormats } from "../export/jewelExporter";

export function parseClipboard(text: string): ParsedClipboard | null {
	const trimmedText = text.trim();

	if (!trimmedText) {
		return null;
	}

	const itemMatch = parseItemText(trimmedText);
	if (itemMatch) {
		return itemMatch;
	}

	const pureNumber = parsePureNumber(trimmedText);
	if (pureNumber) {
		return pureNumber;
	}

	return null;
}

function parseItemText(text: string): ParsedClipboard | null {
	let jewelType: JewelType | null = null;

	const jewelNames = jewelTypes.map((j) => j.label.toLowerCase());
	for (const name of jewelNames) {
		if (text.toLowerCase().includes(name)) {
			const found = jewelTypes.find((j) => j.label.toLowerCase() === name);
			if (found) {
				jewelType = found;
				break;
			}
		}
    }
    
    if (!jewelType) {
        return null;
    }
    const jewelSeedFormat = createRegexFromTemplate(seedTextFormats[jewelType.name]);
	
    const seedMatch = text.match(jewelSeedFormat);
	if (!seedMatch) {
		return null;
	}
   
	const seed = parseInt(seedMatch[1], 10);
	if (isNaN(seed)) {
		return null;
	}

	return {
		seed,
		jewelType,
	};
}

function createRegexFromTemplate(tpl: string) {
  const pattern = tpl
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\{\\\{.*?\\\}\\\}/g, "(.*?)");

  return new RegExp(`${pattern}`);
}

function parsePureNumber(text: string): ParsedClipboard | null {
	const match = text.match(/^(\d+)$/);
	if (!match) {
		return null;
	}

	const seed = parseInt(match[1], 10);
	if (isNaN(seed)) {
		return null;
	}

	return {
		seed,
		jewelType: null,
	};
}
