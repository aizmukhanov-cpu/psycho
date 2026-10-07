import type { Metadata } from "next";
import { isAdminConfigured, isAuthed } from "@/lib/auth";
import { getContent } from "@/lib/content";
import AdminForm from "./AdminForm";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Админка",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <main className="mx-auto max-w-lg px-5 py-24">
        <h1 className="font-serif text-2xl font-bold">Админка не настроена</h1>
        <p className="mt-3 text-muted">
          Добавьте в файл <code>.env.local</code> переменные <code>ADMIN_PASSWORD</code> и <code>SESSION_SECRET</code>{" "}
          (не короче 16 символов) и перезапустите сервер.
        </p>
      </main>
    );
  }
  if (!(await isAuthed())) return <LoginForm />;
  return <AdminForm initial={await getContent()} />;
}
