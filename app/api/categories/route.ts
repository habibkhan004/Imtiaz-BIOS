import { NextRequest, NextResponse } from "next/server";
import type { Category } from "@/app/lib/domain/types";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { getSession } from "@/app/lib/server/session";

export async function GET() {
  const db = await loadDb();
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";
  const items = db.categories
    .filter((c) => isAdmin || c.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  let body: Partial<Category>;
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
    const c: Category = {
      id: randomUUID(),
      name: body.name!,
      slug,
      description: body.description || "",
      parentCategory: body.parentCategory,
      active: body.active !== false,
      sortOrder: body.sortOrder ?? db.categories.length + 1,
      createdAt: now(),
    };
    db.categories.push(c);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "category.create",
      targetType: "category",
      targetId: c.id,
      summary: `Created category ${c.name}`,
    });
    return c;
  });
  return NextResponse.json({ item }, { status: 201 });
}
