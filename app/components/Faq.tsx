import { FAQS } from "../lib/site-data";

export function Faq() {
  return (
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
  );
}
