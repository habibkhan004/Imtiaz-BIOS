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
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">PUBLIC SERVICES</span>
            <h2>
              BIOS &amp; file services{" "}
              <span className="gradient-gold">for technicians</span>
            </h2>
            <p>
              Browse what we offer publicly — open a contact request or create an
              account when you need a custom board number.
            </p>
          </div>
          <div className="services-grid">
            {SERVICES.map((s) => (
              <div className="service-card reveal" key={s.title}>
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="price-tag">{s.price}</span>
                <div style={{ marginTop: 16 }}>
                  <Link href="/contact" className="btn btn-outline btn-sm">
                    Request
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
