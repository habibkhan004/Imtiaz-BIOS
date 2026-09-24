import { NextResponse } from "next/server";
import { loadDb } from "@/app/lib/server/db";
import { requireSession } from "@/app/lib/server/http";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const items = db.uploads.filter((u) => u.userId === auth.user.id);
  return NextResponse.json({ items });
}
