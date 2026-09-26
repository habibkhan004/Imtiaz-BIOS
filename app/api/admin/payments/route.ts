import { NextResponse } from "next/server";
import { loadDb } from "@/app/lib/server/db";
import { requireSession } from "@/app/lib/server/http";

export async function GET() {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  return NextResponse.json({ items: db.payments });
}
