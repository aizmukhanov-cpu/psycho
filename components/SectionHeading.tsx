import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  text,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  text?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-lg leading-relaxed text-muted">{text}</p>}
    </Reveal>
  );
}
