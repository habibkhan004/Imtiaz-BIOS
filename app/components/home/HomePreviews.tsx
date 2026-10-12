import Link from "next/link";
import {
  CATEGORIES,
  LIBRARY_FILES,
  SERVICES,
  categoryFileCount,
} from "../../lib/site-data";
import { TestimonialsGrid } from "./TestimonialsSection";

export function HomeServicesPreview() {
  return (
    <section>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">SERVICES</span>
          <h2>
            BIOS &amp; file services{" "}
            <span className="gradient-gold">technicians use</span>
          </h2>
          <p>Flashing, unlocks, boardviews, schematics, and verification requests.</p>
        </div>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <Link
              href={`/services/${s.slug}`}
              className="service-card reveal service-card-link"
              key={s.slug}
            >
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="price-tag">{s.price}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function HomeLibraryPreview() {
  const preview = LIBRARY_FILES.filter((f) => f.verified).slice(0, 4);
  let liveCount = LIBRARY_FILES.length;
  try {
    const { loadDb } = await import("../../lib/server/db");
    const db = await loadDb();
    const published = db.files.filter((f) => f.status === "published").length;
    if (published > 0) liveCount = published;
  } catch {
    /* keep static count */
  }
  return (
    <section>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">FILE LIBRARY</span>
          <h2>
            Verified dumps &amp;{" "}
            <span className="gradient-cyan">boardviews</span>
          </h2>
          <p>
            {liveCount}+ files ready to browse — search by board number or
            filter by brand.
          </p>
        </div>
        <div className="lib-table">
          <div className="lib-row head">
            <span>Board / Model</span>
            <span>Brand</span>
            <span>Type</span>
            <span>Size</span>
            <span>Actions</span>
          </div>
          {preview.map((item) => (
            <div className="lib-row" key={item.id}>
              <span className="lib-model">{item.model}</span>
              <span>
                <span className="tag tag-brand">{item.brand}</span>
              </span>
              <span>{item.type}</span>
              <span>
                {item.size} <span className="tag tag-verified">✓ verified</span>
              </span>
              <div className="action-btns">
                <Link href={`/library/${item.id}`} className="btn btn-download btn-sm">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <Link href="/library" className="btn btn-primary">
            Open full library →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeCategoriesPreview() {
  return (
    <section>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">CATEGORIES</span>
          <h2>
            Browse by <span className="gradient-purple">file type</span>
          </h2>
        </div>
        <div className="brand-grid">
          {CATEGORIES.map((c) => (
            <Link href={`/categories/${c.slug}`} className="brand-card reveal" key={c.slug}>
              <div className="brand-icon">{c.icon}</div>
              <h3>{c.name}</h3>
              <p>
                {categoryFileCount(c.slug)} file
                {categoryFileCount(c.slug) !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeTestimonialsPreview() {
  return (
    <section>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">TESTIMONIALS</span>
          <h2>
            What our <span className="gradient-cyan">clients</span> say
          </h2>
        </div>
        <TestimonialsGrid />
      </div>
    </section>
  );
}

export function HomeContactCta() {
  return (
    <section>
      <div className="wrap">
        <div className="contact-box reveal" style={{ gridTemplateColumns: "1fr" }}>
          <div className="contact-info" style={{ textAlign: "center" }}>
            <span className="eyebrow">NEED A FILE?</span>
            <h2>Open a request or browse the FAQ</h2>
            <p>
              Can&apos;t find your board number? Send us the PCB stamp and we&apos;ll
              help track it down.
            </p>
            <div
              className="hero-actions"
              style={{ justifyContent: "center", marginBottom: 0 }}
            >
              <Link href="/contact" className="btn btn-primary">
                Contact us
              </Link>
              <Link href="/faq" className="btn btn-outline">
                Read FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
