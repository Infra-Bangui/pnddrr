import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let user: { login: string; role: string } | null = null;
  try {
    const s = await getSession(req);
    if (s) user = { login: s.login, role: s.role };
  } catch {
    /* cookie absent ou invalide : rester sur l’écran de connexion */
  }
  return NextResponse.json(
    {
      server: true,
      demo: process.env.PNDDRR_DEMO === "1",
      user,
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
