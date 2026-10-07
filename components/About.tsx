import { BookMarked, Lightbulb, MessagesSquare, Mic2, type LucideIcon } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const items: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: BookMarked,
    title: "Книг становится больше, а времени на чтение меньше",
    text: "Мы выбираем одну тему на месяц и собираем материалы, которые действительно стоят вашего внимания.",
  },
  {
    icon: Lightbulb,
    title: "Прочитать мало — важно понять",
    text: "Обсуждаем идеи и применяем их в практике: что это значит для клиентов и для нас самих.",
  },
  {
    icon: MessagesSquare,
    title: "После хорошей книги хочется поговорить",
    text: "Сообщество коллег и единомышленников, с которыми можно спорить и вдохновляться. Быть специалистом необязательно.",
  },
  {
    icon: Mic2,
    title: "Хочется услышать мнение экспертов",
    text: "Раз в три месяца приглашаем интересного гостя для живой беседы и ответов на ваши вопросы.",
  },
];

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="О сообществе" title="Зачем вам книжное сообщество?" />
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 100}>
              <article className="group h-full">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ink text-white transition-all duration-300 group-hover:scale-105 group-hover:bg-accent">
                  <Icon className="h-9 w-9" aria-hidden />
                </span>
                <h3 className="mt-6 text-base font-bold leading-snug text-accent">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
