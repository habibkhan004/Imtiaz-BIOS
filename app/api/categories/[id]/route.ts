import { NextRequest, NextResponse } from "next/server";
import type { Category } from "@/app/lib/domain/types";
import { now, updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { jsonError, requireSession } from "@/app/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  let body: Partial<Category>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  const item = await updateDb((db) => {
    const c = db.categories.find((x) => x.id === id);
    if (!c) return null;
    if (body.name !== undefined) c.name = body.name;
    if (body.description !== undefined) c.description = body.description;
    if (body.active !== undefined) c.active = body.active;
    if (body.sortOrder !== undefined) c.sortOrder = body.sortOrder;
    if (body.slug !== undefined) c.slug = body.slug;
    writeAudit(db, {
      actorId: auth.user.id,
      action: "category.update",
      targetType: "category",
      targetId: c.id,
      summary: `Updated category ${c.name}`,
    });
    return c;
  });
  if (!item) return jsonError("Not found", 404);
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const ok = await updateDb((db) => {
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx < 0) return false;
    const [c] = db.categories.splice(idx, 1);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "category.delete",
      targetType: "category",
      targetId: id,
      summary: `Deleted category ${c.name}`,
    });
    return true;
  });
  if (!ok) return jsonError("Not found", 404);
  return NextResponse.json({ ok: true });
}
