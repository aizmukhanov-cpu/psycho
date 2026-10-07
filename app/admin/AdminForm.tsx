"use client";

import { useActionState, useState, type ReactNode } from "react";
import { ExternalLink, LogOut, Plus, Trash2 } from "lucide-react";
import type { SiteContent } from "@/lib/content-defaults";
import { logout, save, type FormState } from "./actions";

const input =
  "mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-2.5 text-base outline-none transition focus:border-accent";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Card({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-6 sm:p-8">
      <h2 className="font-serif text-xl font-bold">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export default function AdminForm({ initial }: { initial: SiteContent }) {
  const [c, setC] = useState<SiteContent>(initial);
  const [state, action, pending] = useActionState<FormState, FormData>(save, {});

  const patch = (p: Partial<SiteContent>) => setC((prev) => ({ ...prev, ...p }));
  const setPlan = (i: 0 | 1, p: Partial<SiteContent["plans"][0]>) =>
    setC((prev) => {
      const plans = [...prev.plans] as SiteContent["plans"];
      plans[i] = { ...plans[i], ...p };
      return { ...prev, plans };
    });

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 pb-32">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold sm:text-3xl">Админка сообщества</h1>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent"
          >
            Сайт <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
          <form action={logout}>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent">
              <LogOut className="h-4 w-4" aria-hidden /> Выйти
            </button>
          </form>
        </div>
      </header>

      <form action={action} className="mt-8 space-y-6">
        <input type="hidden" name="payload" value={JSON.stringify(c)} />

        <Card title="Основное">
          <Field label="Название сообщества">
            <input className={input} value={c.clubName} onChange={(e) => patch({ clubName: e.target.value })} />
          </Field>
          <Field label="Ссылка для вступления (Telegram)" hint="Только http:// или https://">
            <input className={input} type="url" value={c.contactUrl} onChange={(e) => patch({ contactUrl: e.target.value })} />
          </Field>
          <Field label="Текст кнопки в финальном блоке">
            <input className={input} value={c.contactLabel} onChange={(e) => patch({ contactLabel: e.target.value })} />
          </Field>
        </Card>

        <Card title="Встречи" note="Показываются на сайте в блоке «Темы сезона» и в первом экране.">
          <Field label="Адрес / место встреч" hint="Например: Бишкек, ул. Токтогула 100, кофейня «Книга»">
            <input className={input} value={c.venue} onChange={(e) => patch({ venue: e.target.value })} />
          </Field>
          <Field label="Ссылка на карту (необязательно)" hint="Google Maps, 2ГИС и т. п.">
            <input className={input} type="url" value={c.venueUrl} onChange={(e) => patch({ venueUrl: e.target.value })} />
          </Field>
          <Field label="Ближайшая встреча" hint="Например: 15 ноября, 19:00">
            <input className={input} value={c.nextMeeting} onChange={(e) => patch({ nextMeeting: e.target.value })} />
          </Field>
        </Card>

        <Card title="Главный экран">
          <Field label="Надпись над заголовком">
            <input className={input} value={c.hero.eyebrow} onChange={(e) => patch({ hero: { ...c.hero, eyebrow: e.target.value } })} />
          </Field>
          <Field label="Заголовок">
            <input className={input} value={c.hero.title} onChange={(e) => patch({ hero: { ...c.hero, title: e.target.value } })} />
          </Field>
          <Field label="Подзаголовок">
            <textarea rows={3} className={input} value={c.hero.subtitle} onChange={(e) => patch({ hero: { ...c.hero, subtitle: e.target.value } })} />
          </Field>
        </Card>

        <Card title="Темы сезона" note="Первая карточка считается текущей темой месяца и выделяется красным.">
          {c.topics.map((t, i) => (
            <div key={i} className="rounded-2xl border border-line bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-accent">{i === 0 ? "Тема месяца" : `Тема ${i + 1}`}</span>
                <button
                  type="button"
                  aria-label="Удалить тему"
                  onClick={() => patch({ topics: c.topics.filter((_, k) => k !== i) })}
                  className="rounded-full p-1.5 text-muted transition hover:bg-sand hover:text-accent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Field label="Период">
                  <input className={input} value={t.period} placeholder="Ноябрь" onChange={(e) => patch({ topics: c.topics.map((x, k) => (k === i ? { ...x, period: e.target.value } : x)) })} />
                </Field>
                <Field label="Название">
                  <input className={input} value={t.title} onChange={(e) => patch({ topics: c.topics.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)) })} />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Описание">
                  <textarea rows={2} className={input} value={t.text} onChange={(e) => patch({ topics: c.topics.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)) })} />
                </Field>
              </div>
            </div>
          ))}
          {c.topics.length < 12 && (
            <button
              type="button"
              onClick={() => patch({ topics: [...c.topics, { period: "", title: "", text: "" }] })}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-accent px-5 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white"
            >
              <Plus className="h-4 w-4" /> Добавить тему
            </button>
          )}
        </Card>

        <Card title="Тарифы">
          {([0, 1] as const).map((i) => (
            <div key={i} className="rounded-2xl border border-line bg-background p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Название">
                  <input className={input} value={c.plans[i].name} onChange={(e) => setPlan(i, { name: e.target.value })} />
                </Field>
                <Field label="Цена, сом">
                  <input className={input} type="number" min={0} value={c.plans[i].price} onChange={(e) => setPlan(i, { price: Number(e.target.value) })} />
                </Field>
                <Field label="Период">
                  <input className={input} value={c.plans[i].period} onChange={(e) => setPlan(i, { period: e.target.value })} />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Пояснение">
                  <input className={input} value={c.plans[i].note} onChange={(e) => setPlan(i, { note: e.target.value })} />
                </Field>
              </div>
            </div>
          ))}
          <Field label="Что входит в тариф" hint="Каждый пункт — с новой строки">
            <textarea rows={6} className={input} value={c.planIncludes.join("\n")} onChange={(e) => patch({ planIncludes: e.target.value.split("\n") })} />
          </Field>
        </Card>

        <Card title="Частые вопросы">
          {c.faqs.map((f, i) => (
            <div key={i} className="rounded-2xl border border-line bg-background p-4">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Field label="Вопрос">
                    <input className={input} value={f.q} onChange={(e) => patch({ faqs: c.faqs.map((x, k) => (k === i ? { ...x, q: e.target.value } : x)) })} />
                  </Field>
                </div>
                <button
                  type="button"
                  aria-label="Удалить вопрос"
                  onClick={() => patch({ faqs: c.faqs.filter((_, k) => k !== i) })}
                  className="mt-7 rounded-full p-1.5 text-muted transition hover:bg-sand hover:text-accent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3">
                <Field label="Ответ">
                  <textarea rows={3} className={input} value={f.a} onChange={(e) => patch({ faqs: c.faqs.map((x, k) => (k === i ? { ...x, a: e.target.value } : x)) })} />
                </Field>
              </div>
            </div>
          ))}
          {c.faqs.length < 20 && (
            <button
              type="button"
              onClick={() => patch({ faqs: [...c.faqs, { q: "", a: "" }] })}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-accent px-5 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white"
            >
              <Plus className="h-4 w-4" /> Добавить вопрос
            </button>
          )}
        </Card>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3">
            <p role="status" className={`text-sm ${state.error ? "text-accent" : "text-sage"}`}>
              {state.error ?? (state.ok ? "Сохранено — сайт обновлён" : "")}
            </p>
            <button
              disabled={pending}
              className="rounded-full bg-accent px-7 py-2.5 font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
            >
              {pending ? "Сохраняем…" : "Сохранить"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
