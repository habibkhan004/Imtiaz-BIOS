import { SiteShell } from "../components/SiteShell";
import { TestimonialsGrid } from "../components/home/TestimonialsSection";
import { loadDb } from "../lib/server/db";
import { TESTIMONIALS } from "../lib/site-data";

export const metadata = {
  title: "Testimonials",
  description: "What technicians and shops say about IMTIAZ BIOS.",
};

export default async function TestimonialsPage() {
  let initial = TESTIMONIALS.map((t, i) => ({
    id: `static-${i}`,
    name: t.author,
    roleOrCompany: t.role,
    quote: t.quote,
    rating: 5,
  }));

  try {
    const db = await loadDb();
    const fromDb = (db.testimonials || [])
      .filter((t) => t.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    if (fromDb.length) {
      initial = fromDb.map((t) => ({
        id: t.id,
        name: t.name,
        roleOrCompany: t.roleOrCompany,
        quote: t.quote,
        rating: t.rating,
      }));
    }
  } catch {
    /* use static fallback */
  }

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
          <TestimonialsGrid initial={initial} />
        </div>
      </section>
    </SiteShell>
  );
}
