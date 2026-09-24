import { NextRequest, NextResponse } from "next/server";
import type { Brand } from "@/app/lib/domain/types";
import { updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { jsonError, requireSession } from "@/app/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  let body: Partial<Brand>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  const item = await updateDb((db) => {
    const b = db.brands.find((x) => x.id === id);
    if (!b) return null;
    if (body.name !== undefined) b.name = body.name;
    if (body.description !== undefined) b.description = body.description;
    if (body.logo !== undefined) b.logo = body.logo;
    if (body.active !== undefined) b.active = body.active;
    if (body.slug !== undefined) b.slug = body.slug;
    writeAudit(db, {
      actorId: auth.user.id,
      action: "brand.update",
      targetType: "brand",
      targetId: b.id,
      summary: `Updated brand ${b.name}`,
    });
    return b;
  });
  if (!item) return jsonError("Not found", 404);
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const ok = await updateDb((db) => {
    const idx = db.brands.findIndex((b) => b.id === id);
    if (idx < 0) return false;
    const [b] = db.brands.splice(idx, 1);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "brand.delete",
      targetType: "brand",
      targetId: id,
      summary: `Deleted brand ${b.name}`,
    });
    return true;
  });
  if (!ok) return jsonError("Not found", 404);
  return NextResponse.json({ ok: true });
}
