import { SiteShell } from "../components/SiteShell";
import { FAQS } from "../lib/site-data";

export const metadata = {
  title: "FAQ",
  description: "Common questions about BIOS files, verification, and unlocks.",
};

export default function FaqPage() {
  return (
    <SiteShell>
      <section id="faq">
        <div className="wrap faq-wrap">
          <div className="section-head reveal">
            <span className="eyebrow">FAQ</span>
            <h2>
              Common <span className="gradient-cyan">questions</span>
            </h2>
          </div>
          {FAQS.map((faq) => (
            <details key={faq.q} open={"open" in faq ? faq.open : undefined}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
