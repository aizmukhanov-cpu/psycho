import { createHash, timingSafeEqual } from "node:crypto";
import { sanitizeSnapshot, savePayments } from "@/lib/payments";

export const dynamic = "force-dynamic";

const digest = (v: string) => createHash("sha256").update(v).digest();

// Бот присылает сюда «снимок» участников и заявок. Защита — общий секрет BOT_SYNC_SECRET.
export async function POST(req: Request) {
  const secret = process.env.BOT_SYNC_SECRET;
  if (!secret || secret.length < 16) return Response.json({ error: "not configured" }, { status: 503 });

  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!timingSafeEqual(digest(token), digest(secret))) return Response.json({ error: "unauthorized" }, { status: 401 });

  const text = await req.text();
  if (text.length > 2_000_000) return Response.json({ error: "too large" }, { status: 413 });
  try {
    await savePayments(sanitizeSnapshot(JSON.parse(text)));
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
