import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../components/SiteShell";
import {
  SERVICES,
  getService,
  relatedServices,
} from "../../lib/site-data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  return {
    title: service?.title ?? "Service",
    description: service?.shortDesc,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const related = relatedServices(service.slug);

  return (
    <SiteShell>
      <section className="service-detail-section">
        <div className="wrap">
          <div className="service-detail-hero reveal">
            <Link href="/services" className="service-back-link">
              ← All services
            </Link>
            <div className="service-detail-top">
              <div className="service-detail-copy">
                <span className="eyebrow">SERVICE</span>
                <h1>
                  <span className="service-detail-icon" aria-hidden>
                    {service.icon}
                  </span>{" "}
                  {service.title}
                </h1>
                <p className="service-detail-lead">{service.description}</p>
                <div className="service-detail-meta">
                  {service.access === "free" ? (
                    <span className="tag tag-free">Free</span>
                  ) : service.access === "quote" ? (
                    <span className="tag tag-price">{service.priceLabel}</span>
                  ) : (
                    <span className="tag tag-price">{service.priceLabel}</span>
                  )}
                  {service.turnaround ? (
                    <span className="service-turnaround">
                      Turnaround: {service.turnaround}
                    </span>
                  ) : null}
                </div>
                <div className="hero-actions" style={{ marginBottom: 0, marginTop: 20 }}>
                  <Link
                    href={`/contact?service=${encodeURIComponent(service.slug)}`}
                    className="btn btn-primary"
                  >
                    Request this service
                  </Link>
                  <Link href="/contact" className="btn btn-outline">
                    Contact
                  </Link>
                </div>
              </div>
              <div className="service-detail-media" aria-hidden>
                {service.images.length > 0 ? (
                  <div className="service-gallery">
                    {service.images.map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="service-gallery-img" />
                    ))}
                  </div>
                ) : (
                  <div className="service-media-placeholder">
                    <span>{service.icon}</span>
                    <p>{service.title}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="service-detail-grid">
            <div className="service-detail-block reveal">
              <h2>What you get</h2>
              <ul className="service-feature-list">
                {service.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            {service.includes?.length ? (
              <div className="service-detail-block reveal">
                <h2>Includes</h2>
                <ul className="service-feature-list">
                  {service.includes.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {service.excludes?.length ? (
              <div className="service-detail-block reveal">
                <h2>Not included</h2>
                <ul className="service-feature-list muted">
                  {service.excludes.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {service.forWho ? (
            <div className="service-detail-block reveal" style={{ marginTop: 24 }}>
              <h2>Who it&apos;s for</h2>
              <p>{service.forWho}</p>
            </div>
          ) : null}

          <p className="service-trust-note reveal">
            Files and unlocks follow our verified-bench notes where available.
            Always match board revision and chip ID before programming a customer
            machine.
          </p>

          {service.faqs?.length ? (
            <div className="service-detail-faqs reveal">
              <h2>FAQ</h2>
              {service.faqs.map((item) => (
                <details key={item.q} className="service-faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          ) : null}

          {related.length ? (
            <div className="service-related reveal">
              <h2>Related services</h2>
              <div className="services-grid">
                {related.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="service-card service-card-link"
                  >
                    <div className="service-icon">{s.icon}</div>
                    <h3>{s.title}</h3>
                    <p>{s.shortDesc}</p>
                    <span className="price-tag">{s.priceLabel}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </SiteShell>
  );
}
