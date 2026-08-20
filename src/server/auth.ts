import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "pnddrr_session";
const MAX_AGE = 8 * 60 * 60;

export function hashPwd(password: string): string {
  return (
    "sha256:" +
    createHash("sha256").update("PNDDRR|" + password, "utf8").digest("hex")
  );
}

export function pwdOk(stored: string | undefined, saisie: string): boolean {
  if (!stored) return false;
  const expected = stored.startsWith("sha256:") ? stored : hashPwd(stored);
  const got = hashPwd(saisie);
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function secret(): string {
  const s = process.env.SESSION_SECRET || "";
  if (s.length >= 16) return s;
  if (process.env.NODE_ENV !== "production") return "dev-only-not-for-production";
  throw new Error("SESSION_SECRET manquant (au moins 16 caractères)");
}

type Session = { login: string; role: string; exp: number };

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function makeToken(login: string, role: string): string {
  const body = Buffer.from(
    JSON.stringify({ login, role, exp: Date.now() + MAX_AGE * 1000 } satisfies Session)
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readToken(token: string | undefined): Session | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Session;
    if (!s.login || !s.exp || s.exp < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export async function getSession(req?: Request): Promise<Session | null> {
  if (req) {
    const fromHeader = readToken(cookieFromHeader(req.headers.get("cookie")));
    if (fromHeader) return fromHeader;
  }
  try {
    const jar = await cookies();
    return readToken(jar.get(COOKIE)?.value);
  } catch {
    return null;
  }
}

function cookieFromHeader(header: string | null): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    if (trimmed.slice(0, eq) === COOKIE) {
      try {
        return decodeURIComponent(trimmed.slice(eq + 1));
      } catch {
        return trimmed.slice(eq + 1);
      }
    }
  }
  return undefined;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.PNDDRR_SECURE_COOKIE === "1",
    expires: new Date(Date.now() + MAX_AGE * 1000),
  };
}

export { COOKIE, MAX_AGE };

export function newId(): string {
  return randomBytes(8).toString("hex");
}
