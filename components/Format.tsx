import { Clapperboard, FileText, Headphones, BookOpen, MapPin, MessagesSquare, Mic2, type LucideIcon } from "lucide-react";
import Button from "./Button";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const materials: { icon: LucideIcon; label: string }[] = [
  { icon: BookOpen, label: "Книги" },
  { icon: FileText, label: "Статьи" },
  { icon: Headphones, label: "Подкасты" },
  { icon: Clapperboard, label: "Фильмы" },
];

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: MapPin,
    title: "Офлайн-встречи",
    text: "1–2 раза в месяц обсуждаем тему в небольшой группе: главные идеи, личный опыт, неожиданные выводы и спорные тезисы.",
  },
  {
    icon: MessagesSquare,
    title: "Чат группы и чат сообщества",
    text: "Место, где продолжается обсуждение: делимся впечатлениями, помогаем друг другу и обмениваемся находками.",
  },
  {
    icon: Mic2,
    title: "Гость раз в 3 месяца",
    text: "Приглашаем эксперта, чтобы взглянуть на тему шире и задать вопросы напрямую.",
  },
];

export default function Format({ contactUrl }: { contactUrl: string }) {
  return (
    <section id="format" className="bg-sand/70 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-5">
        <SectionHeading eyebrow="Формат" title="Как работает книжный клуб?" text="Каждый месяц — одна тема и несколько форматов материалов." />

        <Reveal className="mt-8 flex flex-wrap justify-center gap-3">
          {materials.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold">
              <Icon className="h-4 w-4 text-accent" aria-hidden /> {label}
            </span>
          ))}
        </Reveal>

        <ul className="mt-14 space-y-10">
          {features.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 100}>
              <li className="flex gap-6">
                <Icon className="mt-1 h-10 w-10 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
                <div>
                  <h3 className="font-bold text-accent">{title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-14 text-center">
          <Button href={contactUrl}>Вступить в клуб</Button>
        </Reveal>
      </div>
    </section>
  );
}
