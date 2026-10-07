import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import type { Faq as FaqItem } from "@/lib/content-defaults";

export default function Faq({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section id="faq" className="bg-sand/70 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow="FAQ" title="Частые вопросы" />
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 50}>
              <details className="group rounded-2xl border border-line bg-card px-6 py-5 transition-shadow open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-accent transition-transform duration-300 group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
