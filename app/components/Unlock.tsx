"use client";

import { BRANDS } from "../lib/site-data";

export function Unlock() {
  const requestBrand = (name: string) => {
    sessionStorage.setItem("imtiaz-contact-msg", `${name} password removal — `);
    sessionStorage.removeItem("imtiaz-contact-model");
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    window.dispatchEvent(new Event("imtiaz-contact-prefill"));
  };

  return (
    <section id="unlock">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">PASSWORD SUPPORT</span>
          <h2>
            BIOS &amp; supervisor <span className="gradient-gold">password removal</span>
          </h2>
          <p>
            Locked out after a board swap or a second-hand unit with a forgotten
            password? Pick your brand and open a request with the service tag or
            serial.
          </p>
        </div>
        <div className="brand-grid" id="brandGrid">
          {BRANDS.map((b, index) => (
            <div
              className="brand-card"
              key={b.name}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => requestBrand(b.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") requestBrand(b.name);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="brand-icon">{b.icon}</div>
              <h3>{b.name}</h3>
              <p>{b.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
