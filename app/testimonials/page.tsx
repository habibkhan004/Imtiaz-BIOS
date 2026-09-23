import { SiteShell } from "../components/SiteShell";
import { TESTIMONIALS } from "../lib/site-data";

export const metadata = {
  title: "Testimonials",
  description: "What technicians and shops say about IMTIAZ BIOS.",
};

export default function TestimonialsPage() {
  return (
    <SiteShell>
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">TESTIMONIALS</span>
            <h2>
              What our <span className="gradient-cyan">clients</span> say
            </h2>
            <p>
              Real feedback from technicians and repair shops who trust IMTIAZ BIOS.
            </p>
          </div>
          <div className="testimonial-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testimonial-card reveal" key={t.author}>
                <div className="stars">★★★★★</div>
                <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="author">
                  {t.author} <span>— {t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
