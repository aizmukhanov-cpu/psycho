import Button from "./Button";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { CalendarDays, MapPin } from "lucide-react";
import type { Topic } from "@/lib/content-defaults";

export default function MonthlyTopic({
  topics,
  contactUrl,
  nextMeeting,
  venue,
  venueUrl,
}: {
  topics: Topic[];
  contactUrl: string;
  nextMeeting: string;
  venue: string;
  venueUrl: string;
}) {
  return (
    <section id="topic" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Анонс"
          title="Темы сезона"
          text="Каждый месяц мы публикуем здесь новую тему и подборку материалов."
        />
        {(nextMeeting || venue) && (
          <ul className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold">
            {nextMeeting && (
              <li className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-white">
                <CalendarDays className="h-4 w-4" aria-hidden /> Ближайшая встреча: {nextMeeting}
              </li>
            )}
            {venue && (
              <li className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2">
                <MapPin className="h-4 w-4 text-accent" aria-hidden />
                {venueUrl ? (
                  <a href={venueUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-accent hover:underline">
                    {venue}
                  </a>
                ) : (
                  venue
                )}
              </li>
            )}
          </ul>
        )}
      </div>

      <Reveal className="mt-12">
        <ul className="no-scrollbar mx-auto flex max-w-6xl snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4">
          {topics.map((t, i) => (
            <li key={t.title} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-[calc(25%-15px)]">
              <article
                className={`flex h-full flex-col overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  i === 0 ? "border-accent bg-card shadow-md shadow-accent/10" : "border-line bg-card"
                }`}
              >
                <div
                  className={`relative flex aspect-[4/3] items-end p-6 ${
                    i === 0 ? "bg-accent" : "bg-ink"
                  }`}
                >
                  <div aria-hidden className="absolute right-4 top-2 font-serif text-8xl font-bold text-white/10">
                    {i + 1}
                  </div>
                  <h3 className="relative font-serif text-xl font-bold leading-tight text-white">{t.title}</h3>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm font-bold text-accent">{t.period}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{t.text}</p>
                  <a
                    href={contactUrl}
                    className="mt-5 inline-flex w-fit rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent"
                  >
                    Подробнее
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="mt-8 text-center">
        <Button href={contactUrl}>Вступить в клуб</Button>
      </div>
    </section>
  );
}
