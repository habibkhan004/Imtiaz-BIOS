import { NextRequest, NextResponse } from "next/server";
import { loadDb } from "@/app/lib/server/db";
import { requireSession } from "@/app/lib/server/http";
import { parsePageParams, paginate } from "@/app/lib/server/pagination";

export async function GET(req: NextRequest) {
  const auth = await requireSession(["ADMIN", "TECHNICIAN"]);
  if (!auth.ok) return auth.response;
  const db = await loadDb();
  const sp = req.nextUrl.searchParams;
  const pageParams = parsePageParams(sp, 50);

  const requests = [...db.requests]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => {
      const user = db.users.find((u) => u.id === r.userId);
      return {
        ...r,
        customerName: user?.name || "Unknown",
        customerEmail: user?.email || "",
      };
    });

  const tickets = [...db.tickets]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((t) => {
      const user = t.userId ? db.users.find((u) => u.id === t.userId) : null;
      return {
        ...t,
        customerName: user?.name || "Guest",
        customerEmail: user?.email || "",
      };
    });

  return NextResponse.json({
    requests: paginate(requests, pageParams),
    tickets: paginate(tickets, pageParams),
  });
}
