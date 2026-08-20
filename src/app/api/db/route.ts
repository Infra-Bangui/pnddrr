import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { isDbShape, readDb, saveClientDb } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  try {
    const db = await readDb();
    return NextResponse.json(db, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  if (!isDbShape(body)) {
    return NextResponse.json({ error: "Registre invalide" }, { status: 400 });
  }
  if (body.users.length < 1) {
    return NextResponse.json({ error: "Au moins un compte utilisateur est requis" }, { status: 400 });
  }
  const db = await saveClientDb(body);
  return NextResponse.json(db, { headers: { "Cache-Control": "private, no-store" } });
}
