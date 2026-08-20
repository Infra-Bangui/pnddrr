import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    server: true,
    demo: process.env.PNDDRR_DEMO === "1",
  });
}
