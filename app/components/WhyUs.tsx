import { FEATURES } from "../lib/site-data";

export function WhyUs() {
  return (
    <section id="why">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">WHY IMTIAZ BIOS</span>
          <h2>
            Built around the bench,{" "}
            <span className="gradient-purple">not a ticket room</span>
          </h2>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature reveal" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
