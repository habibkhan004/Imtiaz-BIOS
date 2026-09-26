import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/app/lib/server/session";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
