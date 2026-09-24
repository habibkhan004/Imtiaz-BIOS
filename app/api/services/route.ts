import { NextRequest, NextResponse } from "next/server";
import type { ServiceItem, SupportTicket } from "@/app/lib/domain/types";
import { loadDb, nextTicketNumber, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { getSession } from "@/app/lib/server/session";

export async function GET() {
  const db = await loadDb();
  const session = await getSession();
  const items =
    session?.role === "ADMIN"
      ? db.services
      : db.services.filter((s) => s.active);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  let body: Partial<ServiceItem>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  if (!body.name) return jsonError("name required");
  const item = await updateDb((db) => {
    const ts = now();
    const s: ServiceItem = {
      id: randomUUID(),
      name: body.name!,
      description: body.description || "",
      price: Number(body.price || 0),
      icon: body.icon || "⚙️",
      active: body.active !== false,
      featured: Boolean(body.featured),
      createdAt: ts,
      updatedAt: ts,
    };
    db.services.push(s);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "service.create",
      targetType: "service",
      targetId: s.id,
      summary: `Created service ${s.name}`,
    });
    return s;
  });
  return NextResponse.json({ item }, { status: 201 });
}
