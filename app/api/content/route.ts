import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

// Публичные данные для Telegram-бота: только тарифы (цены редактируются в админке).
export async function GET() {
  const { plans } = await getContent();
  return Response.json({ plans }, { headers: { "Cache-Control": "no-store" } });
}
