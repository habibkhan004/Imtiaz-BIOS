import Link from "next/link";
import { SiteShell } from "../components/SiteShell";
import { SERVICES } from "../lib/site-data";

export const metadata = {
  title: "Services",
  description:
    "BIOS flashing, password unlocking, boardview and schematic access from IMTIAZ BIOS.",
};

export default function ServicesPage() {
  return (
    <SiteShell>
      <section className="services-hero-section">
        <div className="wrap">
          <div className="section-head reveal services-hero">
            <span className="eyebrow">PUBLIC SERVICES</span>
            <h2>
              BIOS &amp; file services{" "}
              <span className="gradient-gold">for technicians</span>
            </h2>
            <p>
              Browse what we offer publicly — open a contact request or create an
              account when you need a custom board number.
            </p>
            <div className="hero-actions" style={{ marginBottom: 0, marginTop: 20 }}>
              <Link href="/contact" className="btn btn-primary">
                Request Services
              </Link>
              <Link href="/library" className="btn btn-outline">
                Browse files
              </Link>
            </div>
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
                <p>{s.shortDesc}</p>
                <span
                  className={`price-tag${s.access === "free" ? " price-tag-free" : ""}`}
                >
                  {s.access === "free" ? "Free" : s.priceLabel}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
