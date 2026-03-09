import type { JewelType, Conqueror } from "$lib/types";
import { conquerors } from "$lib/constants/timeless";
import { loadTemplate, fillTemplate } from "./templateLoader";

const factionNames: Record<string, string> = {
  vaal: "Vaal",
  karui: "Karui",
  maraketh: "Maraketh",
  templar: "Templars",
  eternal: "Eternal Empire",
};

const seedTextFormats: Record<string, string> = {
  eternal: "Commissioned {{SEED}} coins to commemorate {{CONQUEROR}}",
  templar: "Carved to glorify {{SEED}} new faithful converted by {{CONQUEROR}}",
  vaal: "Bathed in the blood of {{SEED}} sacrificed in the name of {{CONQUEROR}}",
  karui: "Commanded leadership over {{SEED}} warriors under {{CONQUEROR}}",
  maraketh:
        "Denoted service of {{SEED}} dekhara in the akhara of {{CONQUEROR}}",
  kalguur: "Remembrancing {{SEED}} songworthy deeds by the line of {{CONQUEROR}}",
};

function resolveConqueror(
  jewelType: JewelType,
  conqueror: Conqueror,
): Conqueror {
  if (conqueror.label !== "Any") {
    return conqueror;
  }

  const conquerorList = conquerors[jewelType.name] || [];
  const nonAnyConqueror = conquerorList.find((c) => c.id !== 1);
  return nonAnyConqueror || conquerorList[1] || conqueror;
}

function getSeedText(
  jewelType: JewelType,
  seed: number,
  conqueror: Conqueror,
): string {
  const format = seedTextFormats[jewelType.name];
  if (!format) {
    return `Seed ${seed}`;
  }

  return format
    .replace("{{SEED}}", String(seed))
    .replace("{{CONQUEROR}}", jewelType.name === 'templar' ? 'High Templar ' + conqueror.label : conqueror.label);
}

export async function exportJewelToPobFormat(
  jewelType: JewelType,
  seed: number,
  conqueror: Conqueror,
): Promise<string> {
  const resolvedConqueror = resolveConqueror(jewelType, conqueror);
  const faction = factionNames[jewelType.name] || jewelType.label;
  const seedText = getSeedText(jewelType, seed, resolvedConqueror);

  const template = await loadTemplate();

  return fillTemplate(template, {
    JEWEL_NAME: jewelType.label,
    FACTION: faction,
    SEED_TEXT: seedText,
  });
}
