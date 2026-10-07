"use client";

import { useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";

const links = [
  { href: "#about", label: "О сообществе" },
  { href: "#format", label: "Как работает" },
  { href: "#topic", label: "Темы сезона" },
  { href: "#pricing", label: "Тарифы" },
  { href: "#faq", label: "Вопросы" },
];

export default function Header({ clubName, contactUrl }: { clubName: string; contactUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex min-w-0 items-center gap-2 font-serif text-base font-semibold">
          <BookOpen className="h-5 w-5 shrink-0 text-[#e8777b]" aria-hidden />
          <span className="truncate">{clubName}</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Основная навигация">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-white/70 transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
          <a
            href={contactUrl}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            Вступить в сообщество
          </a>
        </nav>

        <button
          type="button"
          className="rounded-full p-2 transition-colors hover:bg-white/10 md:hidden"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`grid overflow-hidden transition-all duration-300 md:hidden ${
          open ? "grid-rows-[1fr] border-t border-white/10" : "grid-rows-[0fr]"
        }`}
      >
        <nav className="min-h-0" aria-label="Мобильная навигация">
          <div className="flex flex-col px-5 py-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-base font-medium text-white/80 hover:text-white">
                {l.label}
              </a>
            ))}
            <a href={contactUrl} className="my-2 rounded-full bg-accent px-5 py-3 text-center font-semibold text-white">
              Вступить в сообщество
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
