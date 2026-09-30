import { NextResponse } from "next/server";
import { getDbStatus, loadDb } from "@/app/lib/server/db";

/** Quick check: is MySQL connected and storing data? */
export async function GET() {
  try {
    const db = await loadDb();
    const status = getDbStatus();
    return NextResponse.json({
      ok: true,
      ...status,
      counts: {
        users: db.users.length,
        files: db.files.length,
        categories: db.categories.length,
        brands: db.brands.length,
        uploads: db.uploads.length,
        requests: db.requests.length,
        tickets: db.tickets.length,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "DB health check failed",
        ...getDbStatus(),
      },
      { status: 503 },
    );
  }
}
