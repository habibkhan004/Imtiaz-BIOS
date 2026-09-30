import { NextRequest, NextResponse } from "next/server";
import type { FileAsset } from "@/app/lib/domain/types";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { assertCanDownload } from "@/app/lib/server/entitlement";
import { writeAudit } from "@/app/lib/server/audit";
import { fileStorage, validateUploadMeta } from "@/app/lib/server/file-storage";
import { jsonError, requireSession } from "@/app/lib/server/http";
import { getSession } from "@/app/lib/server/session";

function enrich(db: Awaited<ReturnType<typeof loadDb>>, f: FileAsset) {
  const brand = db.brands.find((b) => b.id === f.brandId);
  const category = db.categories.find((c) => c.id === f.categoryId);
  const uploader = db.users.find((u) => u.id === f.uploaderId);
  return {
    ...f,
    brandName: brand?.name ?? "",
    categoryName: category?.name ?? "",
    uploaderName: uploader?.name ?? "Unknown",
    /** App download link — binary is on disk; DB holds storageKey */
    downloadUrl: `/api/files/${f.id}/download`,
  };
}

export async function GET(req: NextRequest) {
  const db = await loadDb();
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase();
  const brand = sp.get("brand") || "";
  const category = sp.get("category") || "";
  const fileType = sp.get("fileType") || "";
  const access = sp.get("access") || "";
  const verification = sp.get("verification") || "";
  const sort = sp.get("sort") || "newest";
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") || 24)));

  const session = await getSession();
  const isStaff = session?.role === "ADMIN" || session?.role === "TECHNICIAN";

  let list = db.files.filter((f) => (isStaff ? true : f.status === "published"));

  if (q) {
    list = list.filter((f) => {
      const brandName = db.brands.find((b) => b.id === f.brandId)?.name || "";
      const hay = [
        f.name,
        f.boardNumber,
        f.modelNumber,
        f.fileType,
        f.version,
        brandName,
        ...f.tags,
        f.description,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  if (brand) {
    list = list.filter((f) => {
      const b = db.brands.find((x) => x.id === f.brandId);
      return (
        f.brandId === brand ||
        b?.slug === brand ||
        b?.name.toLowerCase() === brand.toLowerCase()
      );
    });
  }
  if (category) {
    list = list.filter((f) => {
      const c = db.categories.find((x) => x.id === f.categoryId);
      return f.categoryId === category || c?.slug === category;
    });
  }
  if (fileType)
    list = list.filter((f) => f.fileType.toLowerCase() === fileType.toLowerCase());
  if (access === "free")
    list = list.filter((f) => f.accessType === "free" || f.price <= 0);
  if (access === "paid")
    list = list.filter((f) => f.accessType === "paid" && f.price > 0);
  if (verification)
    list = list.filter((f) => f.verificationStatus === verification);

  list = [...list].sort((a, b) => {
    if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
    if (sort === "alpha") return a.name.localeCompare(b.name);
    if (sort === "popular") return b.downloadCount - a.downloadCount;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const total = list.length;
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit).map((f) => {
    const enriched = enrich(db, f);
    let canDownload = false;
    let entitlementReason: string | null = null;
    if (session) {
      const user = db.users.find((u) => u.id === session.userId);
      const ent = assertCanDownload(db, user, f);
      canDownload = ent.ok;
      entitlementReason = ent.reason;
    }
    return { ...enriched, canDownload, entitlementReason };
  });

  return NextResponse.json({ items, total, page, limit });
}

/** Admin: create library file — binary saved to disk folder, path key saved in MySQL FileAsset.storageKey */
export async function POST(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;

  const db0 = await loadDb();
  const settings = db0.settings;
  const contentType = req.headers.get("content-type") || "";

  let meta: Record<string, string> = {};
  let fileBuffer: Buffer | null = null;
  let originalName = "";
  let mimeType = "application/octet-stream";
  let publish = true;
  let verified = false;
  let tags: string[] = [];
  let price = 0;
  let accessType: "free" | "paid" = "free";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    for (const key of [
      "name",
      "categoryId",
      "brandId",
      "boardNumber",
      "modelNumber",
      "fileType",
      "version",
      "description",
      "compatibility",
      "accessType",
      "price",
      "publish",
      "verified",
      "tags",
    ]) {
      const v = form.get(key);
      if (typeof v === "string") meta[key] = v;
    }
    const file = form.get("file");
    if (file && typeof file !== "string") {
      originalName = file.name || "upload.bin";
      mimeType = file.type || "application/octet-stream";
      fileBuffer = Buffer.from(await file.arrayBuffer());
    }
    publish = meta.publish !== "false";
    verified = meta.verified === "true" || meta.verified === "1";
    accessType = meta.accessType === "paid" ? "paid" : "free";
    price = Number(meta.price || 0);
    if (meta.tags) {
      tags = meta.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  } else {
    try {
      const body = await req.json();
      meta = {
        name: String(body.name || ""),
        categoryId: String(body.categoryId || ""),
        brandId: String(body.brandId || ""),
        boardNumber: String(body.boardNumber || ""),
        modelNumber: String(body.modelNumber || ""),
        fileType: String(body.fileType || "BIOS"),
        version: String(body.version || "1.0"),
        description: String(body.description || ""),
        compatibility: String(body.compatibility || ""),
      };
      originalName = String(body.originalName || body.name || "file.bin");
      publish = body.publish !== false;
      verified = Boolean(body.verificationStatus === "verified" || body.verified);
      accessType = body.accessType === "paid" ? "paid" : "free";
      price = Number(body.price || 0);
      tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
      if (body.contentBase64) {
        fileBuffer = Buffer.from(body.contentBase64, "base64");
        mimeType = body.mimeType || mimeType;
      }
      if (body.storageKey && !fileBuffer) {
        meta.storageKey = String(body.storageKey);
      }
    } catch {
      return jsonError("Invalid body");
    }
  }

  // Access option wins: free always clears price; payment requires price > 0
  if (accessType === "paid") {
    if (!(price > 0) || Number.isNaN(price)) {
      return jsonError("Payment option requires a price greater than 0.", 400, "VALIDATION");
    }
  } else {
    accessType = "free";
    price = 0;
  }

  if (!meta.name || !meta.categoryId || !meta.brandId) {
    return jsonError("name, categoryId, and brandId are required.");
  }

  if (!fileBuffer && !meta.storageKey) {
    return jsonError("Choose a file to upload (multipart field: file).", 400);
  }

  let storageKey = meta.storageKey || "pending-upload";
  let sizeBytes = 0;

  if (fileBuffer) {
    const err = validateUploadMeta(
      originalName,
      mimeType,
      fileBuffer.length,
      settings.maxUploadBytes,
      settings.allowedExtensions,
      settings.allowedMimeTypes,
    );
    if (err) return jsonError(err, 400, "VALIDATION");
    const stored = await fileStorage.put(fileBuffer, originalName);
    storageKey = stored.storageKey;
    sizeBytes = stored.sizeBytes;
  }

  const ts = now();
  const file = await updateDb((db) => {
    const f: FileAsset = {
      id: randomUUID(),
      name: meta.name,
      originalName: originalName || meta.name,
      storageKey,
      categoryId: meta.categoryId,
      brandId: meta.brandId,
      boardNumber: meta.boardNumber || meta.modelNumber || "",
      modelNumber: meta.modelNumber || meta.boardNumber || meta.name,
      fileType: meta.fileType || "BIOS",
      version: meta.version || "1.0",
      sizeBytes,
      description: meta.description || "",
      compatibility: meta.compatibility || "",
      tags,
      verificationStatus: verified ? "verified" : "pending",
      verifiedBy: verified ? auth.user.id : undefined,
      verifiedAt: verified ? ts : undefined,
      status: publish ? "published" : "draft",
      accessType,
      price,
      uploaderId: auth.user.id,
      downloadCount: 0,
      publishedAt: publish ? ts : undefined,
      createdAt: ts,
      updatedAt: ts,
    };
    db.files.unshift(f);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "file.create",
      targetType: "file",
      targetId: f.id,
      summary: `Created file ${f.name} (storageKey=${f.storageKey})`,
    });
    return f;
  });

  return NextResponse.json(
    {
      file: {
        ...file,
        downloadUrl: `/api/files/${file.id}/download`,
      },
    },
    { status: 201 },
  );
}
