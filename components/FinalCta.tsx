import { Send } from "lucide-react";
import Button from "./Button";
import Reveal from "./Reveal";

export default function FinalCta({ contactUrl, contactLabel }: { contactUrl: string; contactLabel: string }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="rounded-[2rem] bg-ink px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <h2 className="mx-auto max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl">
              Присоединяйтесь к первой встрече сообщества
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
              Напишите нам — расскажем о ближайшей дате, теме и добавим в чат сообщества.
            </p>
            <div className="mt-8">
              <Button href={contactUrl}>
                <Send className="h-5 w-5" /> {contactLabel}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
