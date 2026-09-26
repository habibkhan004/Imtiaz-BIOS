import { NextResponse } from "next/server";
import { loadDb } from "@/app/lib/server/db";
import { requireSession } from "@/app/lib/server/http";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  return NextResponse.json({
    requests: db.requests.filter((r) => r.userId === auth.user.id),
    tickets: db.tickets.filter((t) => t.userId === auth.user.id),
  });
}
