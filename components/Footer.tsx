import { BookOpen, Send } from "lucide-react";

export default function Footer({ clubName, contactUrl }: { clubName: string; contactUrl: string }) {
  return (
    <footer className="bg-ink py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 text-sm text-white/70 sm:flex-row">
        <span className="flex items-center gap-2 font-serif font-semibold text-white">
          <BookOpen className="h-4 w-4 text-[#e8777b]" aria-hidden /> {clubName}
        </span>
        <a href={contactUrl} className="inline-flex items-center gap-2 transition-colors hover:text-white">
          <Send className="h-4 w-4" aria-hidden /> Мы в Telegram
        </a>
        <span>© {new Date().getFullYear()} {clubName}</span>
      </div>
    </footer>
  );
}
