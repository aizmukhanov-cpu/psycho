import { Check } from "lucide-react";
import Button from "./Button";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import type { SiteContent } from "@/lib/content-defaults";

export default function Pricing({ plans: rawPlans, includes, contactUrl }: { plans: SiteContent["plans"]; includes: string[]; contactUrl: string }) {
  const plans = rawPlans.map((p, i) => ({ ...p, id: i, featured: i === 1 }));
  return (
    <section id="pricing" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="Участие" title="Выберите свой формат" text="В любой тариф входит всё необходимое для полноценного участия." />

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 100}>
              <article
                className={`relative flex h-full flex-col rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.featured
                    ? "border-2 border-accent bg-card shadow-xl shadow-accent/10"
                    : "border border-line bg-card hover:shadow-lg"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-accent px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    Выгодно
                  </span>
                )}
                <h3 className="font-serif text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="font-serif text-5xl font-semibold">{plan.price.toLocaleString("ru-RU")}</span>
                  <span className="text-lg text-muted">сом</span>
                </p>
                <p className="text-sm text-muted">{plan.period}</p>
                <p className="mt-4 text-muted">{plan.note}</p>

                <ul className="my-7 flex-1 space-y-3">
                  {includes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-sage" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                  {plan.featured && (
                    <li className="flex gap-3 font-semibold">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                      <span>Встреча с приглашённым гостем</span>
                    </li>
                  )}
                </ul>

                <Button href={contactUrl} variant={plan.featured ? "primary" : "ghost"} className="w-full">
                  Выбрать тариф
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
