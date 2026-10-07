import "server-only";
import { defaultContent, type SiteContent } from "./content-defaults";
import { sanitizeContent } from "./content-sanitize";
import { readStore, writeStore } from "./storage";

export { sanitizeContent };

const KEY = "site-content";
const FILE = "content.json";

export async function getContent(): Promise<SiteContent> {
  try {
    const raw = await readStore(KEY, FILE);
    return raw ? sanitizeContent(JSON.parse(raw)) : defaultContent;
  } catch {
    return defaultContent;
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  await writeStore(KEY, FILE, JSON.stringify(content, null, 2));
}
