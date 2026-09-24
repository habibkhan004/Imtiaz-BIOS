import { NextRequest, NextResponse } from "next/server";
import type { FileAsset } from "@/app/lib/domain/types";
import { loadDb, now, randomUUID, updateDb } from "@/app/lib/server/db";
import { assertCanDownload } from "@/app/lib/server/entitlement";
import { writeAudit } from "@/app/lib/server/audit";
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
  };
}

export async function GET(req: NextRequest) {
  const db = await loadDb();
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase();
  const brand = sp.get("brand") || "";
  const category = sp.get("category") || "";
  const fileType = sp.get("fileType") || "";
  const access = sp.get("access") || ""; // free|paid
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
      return f.brandId === brand || b?.slug === brand || b?.name.toLowerCase() === brand.toLowerCase();
    });
  }
  if (category) {
    list = list.filter((f) => {
      const c = db.categories.find((x) => x.id === f.categoryId);
      return f.categoryId === category || c?.slug === category;
    });
  }
  if (fileType) list = list.filter((f) => f.fileType.toLowerCase() === fileType.toLowerCase());
  if (access === "free") list = list.filter((f) => f.accessType === "free" || f.price <= 0);
  if (access === "paid") list = list.filter((f) => f.accessType === "paid" && f.price > 0);
  if (verification) list = list.filter((f) => f.verificationStatus === verification);

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

export async function POST(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;

  let body: Partial<FileAsset> & { publish?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  if (!body.name || !body.categoryId || !body.brandId) {
    return jsonError("name, categoryId, and brandId are required.");
  }

  const file = await updateDb((db) => {
    const ts = now();
    const f: FileAsset = {
      id: randomUUID(),
      name: String(body.name),
      originalName: String(body.originalName || body.name),
      storageKey: String(body.storageKey || "pending-upload"),
      categoryId: String(body.categoryId),
      brandId: String(body.brandId),
      boardNumber: String(body.boardNumber || ""),
      modelNumber: String(body.modelNumber || ""),
      fileType: String(body.fileType || "BIOS"),
      version: String(body.version || "1.0"),
      sizeBytes: Number(body.sizeBytes || 0),
      description: String(body.description || ""),
      compatibility: String(body.compatibility || ""),
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      verificationStatus: body.verificationStatus || "pending",
      status: body.publish === false ? "draft" : body.status || "published",
      accessType: body.accessType || "free",
      price: Number(body.price || 0),
      uploaderId: auth.user.id,
      downloadCount: 0,
      publishedAt: body.publish === false ? undefined : ts,
      createdAt: ts,
      updatedAt: ts,
    };
    db.files.unshift(f);
    writeAudit(db, {
      actorId: auth.user.id,
      action: "file.create",
      targetType: "file",
      targetId: f.id,
      summary: `Created file ${f.name}`,
    });
    return f;
  });

  return NextResponse.json({ file }, { status: 201 });
}
