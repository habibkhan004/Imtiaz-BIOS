import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/modules/auth";
import { loadDb } from "@/app/lib/server/db";
import { buildPlatformReport, reportToCsv } from "@/app/lib/reports";

export async function GET(req: NextRequest) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return auth.response;

  const days = Number(req.nextUrl.searchParams.get("days") || 30);
  const format = req.nextUrl.searchParams.get("format");
  const db = await loadDb();
  const report = buildPlatformReport(db, days);

  if (format === "csv") {
    return new NextResponse(reportToCsv(report), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="imtiaz-report-${report.periodDays}d.csv"`,
      },
    });
  }

  return NextResponse.json({ report });
}
