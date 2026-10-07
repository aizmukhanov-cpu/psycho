import { CalendarDays, MapPin, Users } from "lucide-react";
import Button from "./Button";
import type { SiteContent } from "@/lib/content-defaults";

export default function Hero({ hero, venue, contactUrl }: { hero: SiteContent["hero"]; venue: string; contactUrl: string }) {
  const facts = [
    { icon: CalendarDays, text: "1–2 встречи в месяц" },
    { icon: MapPin, text: venue || "Офлайн, в тёплой атмосфере" },
    { icon: Users, text: "Чат сообщества" },
  ];

  return (
    <section id="top" className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-accent/35 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#2c5560]/50 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#2c5560]/40 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-20 text-center sm:pt-28 lg:pb-28">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75 animate-[fadeUp_0.6s_ease-out_both] sm:text-sm">
          {hero.eyebrow}
        </p>

        <h1 className="mt-7 font-serif text-4xl font-bold leading-[1.12] tracking-tight animate-[fadeUp_0.7s_0.1s_ease-out_both] sm:text-6xl lg:text-7xl">
          {hero.title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75 animate-[fadeUp_0.7s_0.2s_ease-out_both]">
          {hero.subtitle}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 animate-[fadeUp_0.7s_0.3s_ease-out_both] sm:flex-row">
          <Button href={contactUrl} className="w-full sm:w-auto">
            Вступить в клуб
          </Button>
          <Button href="#format" variant="light" className="w-full sm:w-auto">
            Как это устроено
          </Button>
        </div>

        <ul className="mx-auto mt-14 grid max-w-3xl gap-3 animate-[fadeUp_0.7s_0.45s_ease-out_both] sm:grid-cols-3">
          {facts.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-sm font-medium backdrop-blur-sm">
              <Icon className="h-5 w-5 text-[#e8777b]" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
