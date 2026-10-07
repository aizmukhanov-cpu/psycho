import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

// Хранилище ключ-значение: на Vercel — Upstash Redis (REST), локально — файлы в data/.
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);

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

export async function readStore(redisKey: string, fileName: string): Promise<string | null> {
  if (useRedis) return (await redis(["GET", redisKey])) as string | null;
  try {
    return await fs.readFile(path.join(process.cwd(), "data", fileName), "utf8");
  } catch {
    return null;
  }
}

export async function writeStore(redisKey: string, fileName: string, value: string): Promise<void> {
  if (useRedis) {
    await redis(["SET", redisKey, value]);
    return;
  }
  if (process.env.VERCEL) throw new Error("Не подключено хранилище (Upstash Redis)");
  const file = path.join(process.cwd(), "data", fileName);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, value, "utf8");
  await fs.rename(tmp, file);
}
