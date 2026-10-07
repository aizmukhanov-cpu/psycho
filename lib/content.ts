import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultContent, type SiteContent } from "./content-defaults";
import { sanitizeContent } from "./content-sanitize";

export { sanitizeContent };

const FILE = path.join(process.cwd(), "data", "content.json");

// Хранилище: на Vercel — Upstash Redis (REST), локально — файл data/content.json.
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "site-content";

async function redis(cmd: unknown[]): Promise<unknown> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? `Redis ${res.status}`);
  return data.result;
}

export async function getContent(): Promise<SiteContent> {
  try {
    const raw =
      REDIS_URL && REDIS_TOKEN ? ((await redis(["GET", KEY])) as string | null) : await fs.readFile(FILE, "utf8");
    return raw ? sanitizeContent(JSON.parse(raw)) : defaultContent;
  } catch {
    return defaultContent;
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  const json = JSON.stringify(content, null, 2);
  if (REDIS_URL && REDIS_TOKEN) {
    await redis(["SET", KEY, json]);
    return;
  }
  if (process.env.VERCEL) throw new Error("Не подключено хранилище (Upstash Redis)");
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, json, "utf8");
  await fs.rename(tmp, FILE);
}
