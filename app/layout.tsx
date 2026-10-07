import type { Metadata, Viewport } from "next";
import { Manrope, Montserrat } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const title = "Книжный клуб для психологов и коучей — новая тема каждый месяц";
const description =
  "Офлайн-встречи 1–2 раза в месяц: книги, статьи, подкасты и фильмы по психологии, живые обсуждения, чат сообщества и приглашённые гости. От 2000 сом в месяц.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "книжный клуб",
    "психология",
    "психологи",
    "коучи",
    "сообщество психологов",
    "Бишкек",
    "обсуждение книг",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "ru_RU",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#11272e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${manrope.variable} ${montserrat.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
