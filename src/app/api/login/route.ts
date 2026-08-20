import { NextResponse } from "next/server";
import { COOKIE, makeToken, pwdOk, sessionCookieOptions } from "@/server/auth";
import { readDb } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hits = new Map<string, { n: number; t: number }>();

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

function limited(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now - row.t > 10 * 60 * 1000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  row.n += 1;
  return row.n > 8;
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (limited(ip)) {
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
    return NextResponse.json({ error: "Identifiant ou mot de passe incorrect." }, { status: 401 });
  }
  const res = NextResponse.json({
    ok: true,
    user: { login: user.login, nom: user.nom, role: user.role },
  });
  res.cookies.set(COOKIE, makeToken(user.login, user.role), sessionCookieOptions());
  return res;
}
