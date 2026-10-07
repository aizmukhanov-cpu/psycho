"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Контент виден по умолчанию (SSR, без JS). После загрузки блоки ниже экрана
// прячутся и плавно появляются при прокрутке.
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    setHidden(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: hidden ? "0ms" : `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        hidden ? "translate-y-5 opacity-0 motion-reduce:opacity-100" : "translate-y-0 opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}
