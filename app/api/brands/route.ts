import { NextRequest, NextResponse } from "next/server";
import type { Brand } from "@/app/lib/domain/types";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { getSession } from "@/app/lib/server/session";

export async function GET() {
  const db = await loadDb();
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";
  const items = db.brands.filter((b) => isAdmin || b.active);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  let body: Partial<Brand>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  if (!body.name) return jsonError("name is required");
  const item = await updateDb((db) => {
    const slug =
      body.slug ||
      body.name!
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const b: Brand = {
      id: randomUUID(),
      name: body.name!,
      slug,
      description: body.description,
      logo: body.logo,
      active: body.active !== false,
      createdAt: now(),
    };
    db.brands.push(b);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "brand.create",
      targetType: "brand",
      targetId: b.id,
      summary: `Created brand ${b.name}`,
    });
    return b;
  });
  return NextResponse.json({ item }, { status: 201 });
}
