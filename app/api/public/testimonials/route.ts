import { NextResponse } from "next/server";
import { loadDb } from "@/app/lib/server/db";
import { TESTIMONIALS } from "@/app/lib/site-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await loadDb();
    const fromDb = (db.testimonials || [])
      .filter((t) => t.active)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

    if (fromDb.length) {
      return NextResponse.json({
        testimonials: fromDb.map((t) => ({
          id: t.id,
          name: t.name,
          roleOrCompany: t.roleOrCompany,
          quote: t.quote,
          rating: t.rating,
        })),
        source: "database",
      });
    }

    return NextResponse.json({
      testimonials: TESTIMONIALS.map((t, i) => ({
        id: `static-${i}`,
        name: t.author,
        roleOrCompany: t.role,
        quote: t.quote,
        rating: 5,
      })),
      source: "fallback",
    });
  } catch {
    return NextResponse.json({
      testimonials: TESTIMONIALS.map((t, i) => ({
        id: `static-${i}`,
        name: t.author,
        roleOrCompany: t.role,
        quote: t.quote,
        rating: 5,
      })),
      source: "fallback",
    });
  }
}
