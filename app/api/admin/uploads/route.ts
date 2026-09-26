import { NextRequest, NextResponse } from "next/server";
import { loadDb } from "@/app/lib/server/db";
import { requireSession } from "@/app/lib/server/http";
import { parsePageParams, paginate } from "@/app/lib/server/pagination";

export async function GET(req: NextRequest) {
  const auth = await requireSession(["ADMIN", "TECHNICIAN"]);
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") || "";
  let items = [...db.uploads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (status) items = items.filter((u) => u.status === status);

  const enriched = items.map((u) => {
    const uploader = db.users.find((x) => x.id === u.userId);
    const brand = db.brands.find((b) => b.id === u.brandId);
    const category = db.categories.find((c) => c.id === u.categoryId);
    return {
      ...u,
      uploaderName: uploader?.name || "Unknown",
      uploaderEmail: uploader?.email || "",
      brandName: brand?.name || "",
      categoryName: category?.name || "",
    };
  });

  return NextResponse.json(paginate(enriched, parsePageParams(sp, 50)));
}
