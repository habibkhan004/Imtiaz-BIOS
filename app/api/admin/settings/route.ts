import { NextRequest, NextResponse } from "next/server";
import type { PlatformSettings } from "@/app/lib/domain/types";
import { loadDb, updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { jsonError, requireSession } from "@/app/lib/server/http";

export async function GET() {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  return NextResponse.json({ settings: db.settings });
}

export async function PUT(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  let body: Partial<PlatformSettings>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  const settings = await updateDb((db) => {
    db.settings = { ...db.settings, ...body };
    writeAudit(db, {
      actorId: auth.user.id,
      action: "settings.update",
      targetType: "settings",
      targetId: "platform",
      summary: "Updated platform settings",
      after: JSON.stringify(db.settings),
    });
    return db.settings;
  });
  return NextResponse.json({ settings });
}
