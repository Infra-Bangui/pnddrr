import { NextResponse } from "next/server";
import { COOKIE, makeToken, pwdOk, sessionCookieOptions } from "@/server/auth";
import { readDb } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hits = new Map<string, { n: number; t: number }>();
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 20;

function clientIp(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const parts = xf.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[0];
  }
  return "local";
}

function tooManyFails(ip: string): boolean {
  const row = hits.get(ip);
  if (!row) return false;
  if (Date.now() - row.t > FAIL_WINDOW_MS) {
    hits.delete(ip);
    return false;
  }
  return row.n >= MAX_FAILS;
}

function recordFail(ip: string) {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now - row.t > FAIL_WINDOW_MS) {
    hits.set(ip, { n: 1, t: now });
    return;
  }
  row.n += 1;
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (tooManyFails(ip)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }
  let body: { login?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const login = String(body.login || "").trim();
  const password = String(body.password || "");
  if (!login || !password) {
    return NextResponse.json({ error: "Identifiant ou mot de passe incorrect." }, { status: 401 });
  }
  let db;
  try {
    db = await readDb();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  const user = db.users.find((u) => u.login === login && u.actif);
  if (!user || !pwdOk(user.pass, password)) {
    recordFail(ip);
    return NextResponse.json({ error: "Identifiant ou mot de passe incorrect." }, { status: 401 });
  }
  hits.delete(ip);
  const res = NextResponse.json({
    ok: true,
    user: { login: user.login, nom: user.nom, role: user.role },
  });
  res.cookies.set(COOKIE, makeToken(user.login, user.role), sessionCookieOptions());
  return res;
}
