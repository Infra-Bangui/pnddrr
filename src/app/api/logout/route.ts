import { NextResponse } from "next/server";
import { COOKIE, sessionCookieOptions } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
