import { defaultContent, type SiteContent } from "./content-defaults";

const str = (v: unknown, fallback: string, max = 600) =>
  typeof v === "string" ? v.trim().slice(0, max) : fallback;

const url = (v: unknown, fallback: string) => {
  const s = str(v, fallback, 300);
  if (s === "") return "";
  return /^https?:\/\//i.test(s) ? s : fallback;
};

const list = <T,>(v: unknown, map: (x: Record<string, unknown>) => T | null, fallback: T[], max = 30): T[] => {
  if (!Array.isArray(v)) return fallback;
  return v
    .slice(0, max)
    .map((x) => (x && typeof x === "object" ? map(x as Record<string, unknown>) : null))
    .filter((x): x is T => x !== null);
};

/** Приводит любые входные данные к корректной структуре (защита от кривого JSON и ввода). */
export function sanitizeContent(raw: unknown): SiteContent {
  const d = defaultContent;
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const hero = (r.hero && typeof r.hero === "object" ? r.hero : {}) as Record<string, unknown>;
  const plans = Array.isArray(r.plans) ? r.plans : [];

  const plan = (i: 0 | 1) => {
    const p = (plans[i] && typeof plans[i] === "object" ? plans[i] : {}) as Record<string, unknown>;
    const price = Number(p.price);
    return {
      name: str(p.name, d.plans[i].name, 60),
      price: Number.isFinite(price) && price >= 0 ? Math.round(price) : d.plans[i].price,
      period: str(p.period, d.plans[i].period, 60),
      note: str(p.note, d.plans[i].note, 200),
    };
  };

  return {
    clubName: str(r.clubName, d.clubName, 60) || d.clubName,
    contactUrl: url(r.contactUrl, d.contactUrl) || d.contactUrl,
    contactLabel: str(r.contactLabel, d.contactLabel, 60) || d.contactLabel,
    venue: str(r.venue, d.venue, 200),
    venueUrl: url(r.venueUrl, d.venueUrl),
    nextMeeting: str(r.nextMeeting, d.nextMeeting, 120),
    hero: {
      eyebrow: str(hero.eyebrow, d.hero.eyebrow, 120),
      title: str(hero.title, d.hero.title, 160) || d.hero.title,
      subtitle: str(hero.subtitle, d.hero.subtitle, 400),
    },
    topics: list(
      r.topics,
      (t) => {
        const title = str(t.title, "", 120);
        return title ? { period: str(t.period, "", 60), title, text: str(t.text, "", 300) } : null;
      },
      d.topics,
      12,
    ),
    plans: [plan(0), plan(1)],
    planIncludes: Array.isArray(r.planIncludes)
      ? r.planIncludes.map((x) => str(x, "", 200)).filter(Boolean).slice(0, 15)
      : d.planIncludes,
    faqs: list(
      r.faqs,
      (f) => {
        const q = str(f.q, "", 200);
        return q ? { q, a: str(f.a, "", 800) } : null;
      },
      d.faqs,
      20,
    ),
  };
}
