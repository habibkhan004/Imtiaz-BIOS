import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/modules/auth";
import { loadDb } from "@/app/lib/server/db";
import { parsePageParams, paginate } from "@/app/lib/server/pagination";

/** Append-only audit listing (§21). No delete endpoint. */
export async function GET(req: NextRequest) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return auth.response;

  const db = await loadDb();
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase();
  const action = sp.get("action") || "";
  const actorId = sp.get("actorId") || "";
  const pageParams = parsePageParams(sp, 40);

  let rows = [...db.auditLogs];
  if (action) rows = rows.filter((r) => r.action === action);
  if (actorId) rows = rows.filter((r) => r.actorId === actorId);
  if (q) {
    rows = rows.filter(
      (r) =>
        r.summary.toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q) ||
        r.targetId.toLowerCase().includes(q) ||
        r.targetType.toLowerCase().includes(q),
    );
  }

  const actors = db.users.map((u) => ({ id: u.id, name: u.name, email: u.email }));
  const actions = Array.from(new Set(db.auditLogs.map((a) => a.action))).sort();
  const page = paginate(rows, pageParams);
  const items = page.items.map((row) => {
    const actor = actors.find((a) => a.id === row.actorId);
    return {
      ...row,
      actorName: actor?.name || row.actorId,
      actorEmail: actor?.email,
    };
  });

  return NextResponse.json({
    ...page,
    items,
    filters: { actions, actors },
  });
}
