import { NextResponse } from "next/server";
import { loadDb } from "@/app/lib/server/db";
import { requireSession } from "@/app/lib/server/http";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const items = db.downloads.filter((d) => d.userId === auth.user.id && d.result === "success");
  const enriched = items.map((d) => {
    const file = db.files.find((f) => f.id === d.fileId);
    return { ...d, fileName: file?.name, version: file?.version };
  });
  return NextResponse.json({ items: enriched });
}
