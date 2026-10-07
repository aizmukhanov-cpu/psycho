import type { ReactNode } from "react";

const variants = {
  primary: "bg-accent text-white hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/25",
  ghost: "border border-line bg-card text-foreground hover:border-accent hover:text-accent",
  light: "border border-white/30 text-white hover:bg-white/10",
  ink: "bg-ink text-white hover:bg-accent",
} as const;

export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: "sm" | "md";
  className?: string;
}) {
  const sizing = size === "sm" ? "px-5 py-2 text-sm" : "px-7 py-3.5 text-base";
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${sizing} ${variants[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
