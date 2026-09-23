import Link from "next/link";
import { SiteShell } from "../components/SiteShell";
import { CATEGORIES, categoryFileCount } from "../lib/site-data";

export const metadata = {
  title: "Categories",
  description: "Browse IMTIAZ BIOS files by category.",
};

export default function CategoriesPage() {
  return (
    <SiteShell>
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">CATEGORIES</span>
            <h2>
              Browse the library by{" "}
              <span className="gradient-purple">category</span>
            </h2>
            <p>
              BIOS dumps, boardviews, schematics, EC firmware, password tools, ME
              regions, pinouts, and repair guides.
            </p>
          </div>
          <div className="brand-grid">
            {CATEGORIES.map((c, index) => (
              <Link
                href={`/categories/${c.slug}`}
                className="brand-card reveal"
                key={c.slug}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="brand-icon">{c.icon}</div>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
                <p style={{ marginTop: 8, color: "var(--accent-cyan)" }}>
                  {categoryFileCount(c.slug)} file
                  {categoryFileCount(c.slug) !== 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
