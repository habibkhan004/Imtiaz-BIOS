import { SERVICES } from "../lib/site-data";

export function Services() {
  return (
    <section id="services">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">REPAIR SERVICES</span>
          <h2>
            Laptop BIOS &amp; <span className="gradient-gold">Motherboard</span> Repair
          </h2>
          <p>
            Professional board-level repair services for all laptop brands. We
            specialize in BIOS flashing, motherboard rework, and component-level
            troubleshooting.
          </p>
        </div>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <div className="service-card reveal" key={s.title}>
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="price-tag">{s.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
