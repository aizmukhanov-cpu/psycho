import "server-only";
import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 дней

const secret = () => process.env.SESSION_SECRET ?? "";
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

const safeEqual = (a: string, b: string) => {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export const isAdminConfigured = () => Boolean(process.env.ADMIN_PASSWORD && secret().length >= 16);

export function checkPassword(input: string) {
  return isAdminConfigured() && safeEqual(input, process.env.ADMIN_PASSWORD!);
}

export async function createSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAuthed() {
  if (!isAdminConfigured()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}
