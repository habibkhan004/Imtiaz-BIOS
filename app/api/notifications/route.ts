import { NextRequest, NextResponse } from "next/server";
import { loadDb, updateDb } from "@/app/lib/server/db";
import { jsonError, requireSession } from "@/app/lib/server/http";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const items = db.notifications.filter((n) => n.userId === auth.user.id);
  const unread = items.filter((n) => !n.read).length;
  return NextResponse.json({ items, unread });
}

export async function PUT(req: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  let body: { id?: string; markAll?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  await updateDb((db) => {
    for (const n of db.notifications) {
      if (n.userId !== auth.user.id) continue;
      if (body.markAll || n.id === body.id) n.read = true;
    }
  });
  return NextResponse.json({ ok: true });
}
