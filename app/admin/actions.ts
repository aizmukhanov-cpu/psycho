"use server";

import { revalidatePath } from "next/cache";
import { checkPassword, createSession, destroySession, isAuthed } from "@/lib/auth";
import { sanitizeContent, saveContent } from "@/lib/content";

export type FormState = { ok?: boolean; error?: string; at?: number };

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 1000)); // притормаживаем перебор
    return { error: "Неверный пароль" };
  }
  await createSession();
  revalidatePath("/admin");
  return { ok: true };
}

export async function logout() {
  await destroySession();
  revalidatePath("/admin");
}

export async function save(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAuthed())) return { error: "Сессия истекла — войдите снова" };
  try {
    const content = sanitizeContent(JSON.parse(String(formData.get("payload") ?? "")));
    await saveContent(content);
  } catch {
    return { error: "Не удалось сохранить: проверьте подключение хранилища (Upstash Redis) или права на запись в data/" };
  }
  revalidatePath("/");
  return { ok: true, at: Date.now() };
}
