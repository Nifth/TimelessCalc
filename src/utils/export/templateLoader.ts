export interface TemplatePlaceholders {
  JEWEL_NAME: string;
  FACTION: string;
  SEED_TEXT: string;
}

let cachedTemplate: string | null = null;

export async function loadTemplate(): Promise<string> {
  if (cachedTemplate) {
    return cachedTemplate;
  }

  const url = "/src/data/templates/jewel.txt";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to load template`);
    }
    const template = await response.text();
    cachedTemplate = template;
    return template;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load template: ${message}`);
  }
}

export function fillTemplate(
  template: string,
  placeholders: TemplatePlaceholders,
): string {
  let result = template;

  for (const [key, value] of Object.entries(placeholders)) {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, String(value));
  }

  return result;
}
