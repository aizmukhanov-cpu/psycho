import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isAuthed } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { getPayments, type PayRequest } from "@/lib/payments";
import LoginForm from "../LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Оплаты", robots: { index: false, follow: false } };

const tz = "Asia/Bishkek";
const dt = (sec: number) =>
  new Date(sec * 1000).toLocaleString("ru-RU", { timeZone: tz, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const day = (sec: number) => new Date(sec * 1000).toLocaleDateString("ru-RU", { timeZone: tz, day: "numeric", month: "long", year: "numeric" });
const nowSec = () => Date.now() / 1000;
const money = (v: number) => `${v.toLocaleString("ru-RU")} сом`;

const statusLabel: Record<PayRequest["status"], { text: string; cls: string }> = {
  approved: { text: "Подтверждена", cls: "bg-[#e3eee7] text-[#2f6b4a]" },
  pending: { text: "На проверке", cls: "bg-[#f7ecd2] text-[#8a6212]" },
  rejected: { text: "Отклонена", cls: "bg-[#f7dede] text-accent-dark" },
};

export default async function PaymentsPage() {
  if (!(await isAuthed())) return <LoginForm />;
  const [data, content] = await Promise.all([getPayments(), getContent()]);
  const planName = (key: string) => (key === "quarter" ? content.plans[1].name : key === "month" ? content.plans[0].name : key);

  const requests = [...(data?.requests ?? [])].sort((a, b) => b.createdAt - a.createdAt);
  const members = [...(data?.members ?? [])].sort((a, b) => a.expiresAt - b.expiresAt);
  const now = nowSec();
  const active = members.filter((m) => m.expiresAt > now);
  const approved = requests.filter((r) => r.status === "approved");
  const total = approved.reduce((sum, r) => sum + r.amount, 0);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-accent">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Назад к настройкам
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">Оплаты и участники</h1>
      <p className="mt-1 text-sm text-muted">
        {data ? `Данные от бота обновлены: ${dt(data.syncedAt / 1000)}` : "Пока нет данных от бота."}
      </p>

      {!data && (
        <p className="mt-6 rounded-2xl border border-line bg-card p-5 text-muted">
          Бот ещё не присылал данные. Проверьте, что в его <code>.env</code> заданы <code>SITE_SYNC_URL</code> и{" "}
          <code>BOT_SYNC_SECRET</code>, а на Vercel — такой же <code>BOT_SYNC_SECRET</code>, затем перезапустите бота.
        </p>
      )}

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Активных участников", String(active.length)],
          ["Подтверждённых оплат", String(approved.length)],
          ["Сумма подтверждённых", money(total)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-card p-5">
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="mt-1 font-serif text-2xl font-bold">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 font-serif text-xl font-bold">Участники</h2>
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {members.length === 0 && <li className="p-5 text-muted">Пока никого.</li>}
        {members.map((m) => (
          <li key={m.userId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-4">
            <div className="min-w-0">
              <p className="truncate font-semibold">{m.name || `id ${m.userId}`}</p>
              <p className="text-sm text-muted">{m.username ? `@${m.username} · ` : ""}{planName(m.plan)}</p>
            </div>
            <p className={`text-sm font-semibold ${m.expiresAt > now ? "text-[#2f6b4a]" : "text-muted"}`}>
              до {day(m.expiresAt)}
            </p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-serif text-xl font-bold">История оплат</h2>
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {requests.length === 0 && <li className="p-5 text-muted">Пока нет заявок.</li>}
        {requests.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4">
            <div className="min-w-0">
              <p className="truncate font-semibold">{r.name || `id ${r.userId}`}</p>
              <p className="text-sm text-muted">
                {r.username ? `@${r.username} · ` : ""}{planName(r.plan)} · {money(r.amount)} · {dt(r.createdAt)}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusLabel[r.status].cls}`}>{statusLabel[r.status].text}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
