import "server-only";
import { readStore, writeStore } from "./storage";

export type PayMember = {
  userId: number;
  name: string;
  username: string;
  plan: string;
  expiresAt: number; // сек (unix)
};

export type PayRequest = {
  id: string;
  userId: number;
  name: string;
  username: string;
  plan: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: number; // сек (unix)
};

export type PaymentsSnapshot = { members: PayMember[]; requests: PayRequest[]; syncedAt: number };

const KEY = "payments-snapshot";
const FILE = "payments.json";

const s = (v: unknown, max = 120) => (typeof v === "string" ? v.slice(0, max) : "");
const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

/** Проверка и очистка данных, пришедших от бота. */
export function sanitizeSnapshot(raw: unknown): PaymentsSnapshot {
  const r = obj(raw);
  const members = (Array.isArray(r.members) ? r.members : []).slice(0, 5000).map((x) => {
    const m = obj(x);
    return { userId: n(m.userId), name: s(m.name), username: s(m.username, 64), plan: s(m.plan, 16), expiresAt: n(m.expiresAt) };
  });
  const requests = (Array.isArray(r.requests) ? r.requests : []).slice(0, 5000).map((x) => {
    const q = obj(x);
    const status = q.status === "approved" || q.status === "rejected" ? q.status : "pending";
    return {
      id: s(q.id, 64), userId: n(q.userId), name: s(q.name), username: s(q.username, 64),
      plan: s(q.plan, 16), amount: n(q.amount), status, createdAt: n(q.createdAt),
    } satisfies PayRequest;
  });
  return { members, requests, syncedAt: Date.now() };
}

export async function savePayments(snapshot: PaymentsSnapshot): Promise<void> {
  await writeStore(KEY, FILE, JSON.stringify(snapshot));
}

export async function getPayments(): Promise<PaymentsSnapshot | null> {
  try {
    const raw = await readStore(KEY, FILE);
    return raw ? (JSON.parse(raw) as PaymentsSnapshot) : null;
  } catch {
    return null;
  }
}
