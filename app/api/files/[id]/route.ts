import { NextRequest, NextResponse } from "next/server";
import type { FileAsset, FilePublishStatus, VerificationStatus } from "@/app/lib/domain/types";
import { loadDb, now, updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { assertCanDownload } from "@/app/lib/server/entitlement";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { getSession } from "@/app/lib/server/session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = await loadDb();
  const file = db.files.find((f) => f.id === id);
  if (!file) return jsonError("File not found", 404, "NOT_FOUND");

  const session = await getSession();
  const isStaff = session?.role === "ADMIN" || session?.role === "TECHNICIAN";
  if (!isStaff && file.status !== "published") {
    return jsonError("File not found", 404, "NOT_FOUND");
  }

  const brand = db.brands.find((b) => b.id === file.brandId);
  const category = db.categories.find((c) => c.id === file.categoryId);
  const versions = db.fileVersions.filter((v) => v.fileAssetId === file.id);
  const user = session ? db.users.find((u) => u.id === session.userId) : null;
  const entitlement = assertCanDownload(db, user, file);

  return NextResponse.json({
    file: {
      ...file,
      brandName: brand?.name,
      categoryName: category?.name,
    },
    versions,
    entitlement,
  });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = await requireSession(["ADMIN", "TECHNICIAN"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  let body: Partial<FileAsset> & {
    verificationNote?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const file = await updateDb((db) => {
    const f = db.files.find((x) => x.id === id);
    if (!f) return null;
    const before = JSON.stringify(f);
    const fields: (keyof FileAsset)[] = [
      "name",
      "boardNumber",
      "modelNumber",
      "fileType",
      "version",
      "description",
      "compatibility",
      "categoryId",
      "brandId",
      "accessType",
      "price",
      "status",
      "storageKey",
      "sizeBytes",
    ];
    for (const key of fields) {
      if (body[key] !== undefined) {
        // @ts-expect-error dynamic assign
        f[key] = body[key];
      }
    }
    if (body.verificationStatus) {
      f.verificationStatus = body.verificationStatus as VerificationStatus;
      f.verificationNote = body.verificationNote;
      f.verifiedBy = auth.user.id;
      f.verifiedAt = now();
    }
    if (body.status === "published" && !f.publishedAt) {
      f.publishedAt = now();
    }
    if (body.status) f.status = body.status as FilePublishStatus;
    f.updatedAt = now();
    writeAudit(db, {
      actorId: auth.user.id,
      action: "file.update",
      targetType: "file",
      targetId: f.id,
      summary: `Updated file ${f.name}`,
      before,
      after: JSON.stringify(f),
    });
    return f;
  });

  if (!file) return jsonError("File not found", 404);
  return NextResponse.json({ file });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  const ok = await updateDb((db) => {
    const idx = db.files.findIndex((f) => f.id === id);
    if (idx < 0) return false;
    const [removed] = db.files.splice(idx, 1);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "file.delete",
      targetType: "file",
      targetId: id,
      summary: `Deleted file ${removed.name}`,
      before: JSON.stringify(removed),
    });
    return true;
  });

  if (!ok) return jsonError("File not found", 404);
  return NextResponse.json({ ok: true });
}
