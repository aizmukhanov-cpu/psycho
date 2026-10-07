"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { login, type FormState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form action={action} className="w-full max-w-sm rounded-3xl border border-line bg-card p-8 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-bold">Вход в админку</h1>
        <label className="mt-6 block text-sm font-semibold" htmlFor="password">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 outline-none transition focus:border-accent"
        />
        {state.error && <p className="mt-3 text-sm text-accent">{state.error}</p>}
        <button
          disabled={pending}
          className="mt-6 w-full rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Проверяем…" : "Войти"}
        </button>
      </form>
    </main>
  );
}
