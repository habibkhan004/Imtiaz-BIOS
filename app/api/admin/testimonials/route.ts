import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { writeAudit } from "@/app/lib/server/audit";
import { loadDb, now, updateDb } from "@/app/lib/server/db";
import { jsonError, requireSession } from "@/app/lib/server/http";

export async function GET() {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const testimonials = [...(db.testimonials || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;

  let body: {
    name?: string;
    roleOrCompany?: string;
    quote?: string;
    rating?: number;
    active?: boolean;
    sortOrder?: number;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  const name = (body.name || "").trim();
  const roleOrCompany = (body.roleOrCompany || "").trim();
  const quote = (body.quote || "").trim();
  if (!name || !quote) {
    return jsonError("Name and quote are required");
  }

  const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
  const ts = now();

  const testimonial = await updateDb((db) => {
    if (!db.testimonials) db.testimonials = [];
    const maxOrder = db.testimonials.reduce(
      (m, t) => Math.max(m, t.sortOrder),
      0,
    );
    const row = {
      id: randomUUID(),
      name,
      roleOrCompany: roleOrCompany || "Client",
      quote,
      rating,
      active: body.active !== false,
      sortOrder:
        typeof body.sortOrder === "number" ? body.sortOrder : maxOrder + 1,
      createdAt: ts,
      updatedAt: ts,
    };
    db.testimonials.push(row);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "testimonial.create",
      targetType: "testimonial",
      targetId: row.id,
      summary: `Added feedback from ${row.name}`,
    });
    return row;
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;

  let body: {
    id?: string;
    name?: string;
    roleOrCompany?: string;
    quote?: string;
    rating?: number;
    active?: boolean;
    sortOrder?: number;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  if (!body.id) return jsonError("id is required");

  const updated = await updateDb((db) => {
    if (!db.testimonials) db.testimonials = [];
    const row = db.testimonials.find((t) => t.id === body.id);
    if (!row) return null;
    if (typeof body.name === "string" && body.name.trim()) {
      row.name = body.name.trim();
    }
    if (typeof body.roleOrCompany === "string") {
      row.roleOrCompany = body.roleOrCompany.trim() || row.roleOrCompany;
    }
    if (typeof body.quote === "string" && body.quote.trim()) {
      row.quote = body.quote.trim();
    }
    if (typeof body.rating === "number") {
      row.rating = Math.min(5, Math.max(1, body.rating));
    }
    if (typeof body.active === "boolean") row.active = body.active;
    if (typeof body.sortOrder === "number") row.sortOrder = body.sortOrder;
    row.updatedAt = now();
    writeAudit(db, {
      actorId: auth.user.id,
      action: "testimonial.update",
      targetType: "testimonial",
      targetId: row.id,
      summary: `Updated feedback from ${row.name}`,
    });
    return row;
  });

  if (!updated) return jsonError("Testimonial not found", 404, "NOT_FOUND");
  return NextResponse.json({ testimonial: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return jsonError("id is required");

  const removed = await updateDb((db) => {
    if (!db.testimonials) db.testimonials = [];
    const idx = db.testimonials.findIndex((t) => t.id === id);
    if (idx < 0) return null;
    const [row] = db.testimonials.splice(idx, 1);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "testimonial.delete",
      targetType: "testimonial",
      targetId: id,
      summary: `Deleted feedback from ${row.name}`,
    });
    return row;
  });

  if (!removed) return jsonError("Testimonial not found", 404, "NOT_FOUND");
  return NextResponse.json({ ok: true });
}
