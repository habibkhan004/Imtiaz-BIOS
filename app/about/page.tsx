import Link from "next/link";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Loader } from "../components/Loader";
import { Particles } from "../components/Particles";
import { ScrollTop } from "../components/ScrollTop";
import { WhyUs } from "../components/WhyUs";
import { FEATURES, SERVICES } from "../lib/site-data";

export const metadata = {
  title: "About",
  description:
    "Built around the bench, not a ticket room. Learn why technicians trust IMTIAZ BIOS.",
};

export default function AboutPage() {
  return (
    <>
      <Loader />
      <Particles />
      <Header />
      <main id="top">
        <section className="hero" style={{ paddingBottom: 40 }}>
          <div className="wrap">
            <div className="section-head reveal" style={{ marginBottom: 0 }}>
              <span className="eyebrow">ABOUT IMTIAZ BIOS</span>
              <h2>
                Built around the bench,{" "}
                <span className="gradient-purple">not a ticket room</span>
              </h2>
              <p>
                Professional BIOS repair, motherboard rework, schematics, boardviews,
                and password unlocking for all laptop brands — with technicians who
                actually work on boards.
              </p>
              <div className="hero-actions" style={{ marginTop: 24, marginBottom: 0 }}>
                <Link href="/#contact" className="btn btn-primary">
                  Open a request
                </Link>
                <Link href="/#library" className="btn btn-outline">
                  Browse library
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="wrap">
          <div className="divider" />
        </div>

        <WhyUs />

        <div className="wrap">
          <div className="divider" />
        </div>

        <section>
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">WHAT WE DO</span>
              <h2>
                Repair services{" "}
                <span className="gradient-gold">technicians rely on</span>
              </h2>
            </div>
            <div className="services-grid">
              {SERVICES.slice(0, 3).map((s) => (
                <div className="service-card reveal" key={s.title}>
                  <div className="service-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <span className="price-tag">{s.price}</span>
                </div>
              ))}
            </div>
            <div className="feature-grid" style={{ marginTop: 24 }}>
              {FEATURES.slice(0, 2).map((f) => (
                <div className="feature reveal" key={f.title}>
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollTop />
    </>
  );
}
