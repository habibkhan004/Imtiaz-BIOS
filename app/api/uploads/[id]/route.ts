import { NextRequest, NextResponse } from "next/server";
import type { FileAsset, UploadStatus } from "@/app/lib/domain/types";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { writeAudit } from "@/app/lib/server/audit";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { pushNotification } from "@/app/lib/server/notifications";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = await loadDb();
  const upload = db.uploads.find((u) => u.id === id);
  if (!upload) return jsonError("Not found", 404);
  const isStaff = auth.user.role === "ADMIN" || auth.user.role === "TECHNICIAN";
  if (!isStaff && upload.userId !== auth.user.id) {
    return jsonError("Forbidden", 403);
  }
  return NextResponse.json({ upload });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = await requireSession(["ADMIN", "TECHNICIAN"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  let body: {
    status?: UploadStatus;
    reviewNote?: string;
    publish?: boolean;
    accessType?: "free" | "paid";
    price?: number;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }

  if (!body.status) return jsonError("status is required");

  const result = await updateDb((db) => {
    const upload = db.uploads.find((u) => u.id === id);
    if (!upload) return null;
    upload.status = body.status!;
    upload.reviewerId = auth.user.id;
    upload.reviewNote = body.reviewNote || "";
    upload.updatedAt = now();

    let publishedFile: FileAsset | null = null;
    if (body.status === "approved" && body.publish !== false) {
      const ts = now();
      const f: FileAsset = {
        id: randomUUID(),
        name: `${upload.boardNumber} ${upload.fileType} ${upload.version}`,
        originalName: upload.originalName,
        storageKey: upload.storageKey,
        categoryId: upload.categoryId,
        brandId: upload.brandId,
        boardNumber: upload.boardNumber,
        modelNumber: upload.modelNumber,
        fileType: upload.fileType,
        version: upload.version,
        sizeBytes: upload.sizeBytes,
        description: upload.description || upload.notes,
        compatibility: "",
        tags: [],
        verificationStatus: "verified",
        verifiedBy: auth.user.id,
        verifiedAt: ts,
        status: "published",
        accessType: body.accessType || "free",
        price: Number(body.price || 0),
        uploaderId: upload.userId,
        downloadCount: 0,
        publishedAt: ts,
        createdAt: ts,
        updatedAt: ts,
      };
      db.files.unshift(f);
      upload.publishedFileId = f.id;
      publishedFile = f;
    }

    pushNotification(db, {
      userId: upload.userId,
      type: "upload_status",
      title: `Upload ${body.status}`,
      body: body.reviewNote || `Your upload ${upload.originalName} is now ${body.status}.`,
      href: "/portal/uploads",
    });

    writeAudit(db, {
      actorId: auth.user.id,
      action: `upload.${body.status}`,
      targetType: "upload",
      targetId: upload.id,
      summary: `Marked upload ${upload.originalName} as ${body.status}`,
    });

    return { upload, publishedFile };
  });

  if (!result) return jsonError("Not found", 404);
  return NextResponse.json(result);
}
