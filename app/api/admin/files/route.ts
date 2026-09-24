import { NextRequest, NextResponse } from "next/server";
import { loadDb } from "@/app/lib/server/db";
import { requireSession } from "@/app/lib/server/http";
import { parsePageParams, paginate } from "@/app/lib/server/pagination";

export async function GET(req: NextRequest) {
  const auth = await requireSession(["ADMIN"]);
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase();
  let files = [...db.files];
  if (q) {
    files = files.filter((f) => {
      const brand = db.brands.find((b) => b.id === f.brandId)?.name || "";
      return [f.name, f.boardNumber, f.modelNumber, brand, f.fileType]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }
  const page = paginate(files, parsePageParams(sp));
  return NextResponse.json(page);
}
