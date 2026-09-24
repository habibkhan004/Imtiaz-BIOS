import { NextRequest, NextResponse } from "next/server";
import type { UploadSubmission } from "@/app/lib/domain/types";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { fileStorage, validateUploadMeta } from "@/app/lib/server/file-storage";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { pushNotification } from "@/app/lib/server/notifications";

export async function POST(req: NextRequest) {
  const auth = await requireSession(["USER", "ADMIN", "TECHNICIAN"]);
  if (!auth.ok) return auth.response;

  const db0 = await loadDb();
  const settings = db0.settings;
  const contentType = req.headers.get("content-type") || "";

  let meta: Record<string, string> = {};
  let fileBuffer: Buffer | null = null;
  let originalName = "";
  let mimeType = "application/octet-stream";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    for (const key of [
      "categoryId",
      "brandId",
      "boardNumber",
      "modelNumber",
      "fileType",
      "version",
      "description",
      "notes",
    ]) {
      const v = form.get(key);
      if (typeof v === "string") meta[key] = v;
    }
    if (file && typeof file !== "string") {
      originalName = file.name || "upload.bin";
      mimeType = file.type || "application/octet-stream";
      fileBuffer = Buffer.from(await file.arrayBuffer());
    }
  } else {
    try {
      const body = await req.json();
      meta = body;
      originalName = body.originalName || "metadata-only.bin";
      if (body.contentBase64) {
        fileBuffer = Buffer.from(body.contentBase64, "base64");
        mimeType = body.mimeType || mimeType;
      }
    } catch {
      return jsonError("Invalid body");
    }
  }

  if (!meta.categoryId || !meta.brandId || !meta.boardNumber) {
    return jsonError("categoryId, brandId, and boardNumber are required.");
  }

  const sizeBytes = fileBuffer?.length || 0;
  if (fileBuffer) {
    const err = validateUploadMeta(
      originalName,
      mimeType,
      sizeBytes,
      settings.maxUploadBytes,
      settings.allowedExtensions,
      settings.allowedMimeTypes,
    );
    if (err) return jsonError(err, 400, "VALIDATION");
  }

  let storageKey = "pending-upload";
  if (fileBuffer) {
    const stored = await fileStorage.put(fileBuffer, originalName);
    storageKey = stored.storageKey;
  }

  const upload = await updateDb((db) => {
    const ts = now();
    const row: UploadSubmission = {
      id: randomUUID(),
      userId: auth.user.id,
      originalName,
      storageKey,
      mimeType,
      sizeBytes,
      categoryId: meta.categoryId,
      brandId: meta.brandId,
      boardNumber: meta.boardNumber,
      modelNumber: meta.modelNumber || "",
      fileType: meta.fileType || "BIOS",
      version: meta.version || "1.0",
      description: meta.description || "",
      notes: meta.notes || "",
      status: "pending",
      createdAt: ts,
      updatedAt: ts,
    };
    db.uploads.unshift(row);
    pushNotification(db, {
      userId: auth.user.id,
      type: "upload",
      title: "Upload received",
      body: `${originalName} is pending review.`,
      href: "/portal/uploads",
    });
    return row;
  });

  return NextResponse.json({ upload }, { status: 201 });
}

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const isStaff = auth.user.role === "ADMIN" || auth.user.role === "TECHNICIAN";
  const items = isStaff
    ? db.uploads
    : db.uploads.filter((u) => u.userId === auth.user.id);
  return NextResponse.json({ items });
}
