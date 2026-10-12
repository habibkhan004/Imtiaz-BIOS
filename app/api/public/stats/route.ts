import { NextResponse } from "next/server";
import { loadDb } from "@/app/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await loadDb();
    const published = db.files.filter((f) => f.status === "published");
    const verifiedFiles = published.filter(
      (f) => f.verificationStatus === "verified",
    ).length;
    const totalDownloads =
      published.reduce((sum, f) => sum + (f.downloadCount || 0), 0) ||
      db.downloads.length;
    const brands = db.brands.filter((b) => b.active).length;
    const categories = db.categories.filter((c) => c.active).length;
    const services = db.services.filter((s) => s.active).length;

    return NextResponse.json({
      publishedFiles: published.length,
      totalDownloads,
      brands,
      categories,
      verifiedFiles,
      services,
    });
  } catch {
    return NextResponse.json(
      {
        publishedFiles: 0,
        totalDownloads: 0,
        brands: 0,
        categories: 0,
        verifiedFiles: 0,
        services: 0,
      },
      { status: 200 },
    );
  }
}
