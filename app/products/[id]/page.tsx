import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { Loader } from "../../components/Loader";
import { Particles } from "../../components/Particles";
import { ScrollTop } from "../../components/ScrollTop";
import { INITIAL_LIBRARY } from "../../lib/site-data";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return INITIAL_LIBRARY.map((item) => ({
    id: item.model,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const item = INITIAL_LIBRARY.find(
    (entry) => entry.model.toLowerCase() === decoded.toLowerCase(),
  );
  return {
    title: item ? item.model : decoded,
    description: item
      ? `${item.type} for ${item.brand} board ${item.model}`
      : `Board file details for ${decoded}`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const item = INITIAL_LIBRARY.find(
    (entry) => entry.model.toLowerCase() === decoded.toLowerCase(),
  );

  if (!item) notFound();

  return (
    <>
      <Loader />
      <Particles />
      <Header />
      <main id="top">
        <section className="hero" style={{ paddingBottom: 48 }}>
          <div className="wrap">
            <div className="section-head reveal" style={{ maxWidth: 720, marginBottom: 0 }}>
              <span className="eyebrow">LIBRARY FILE</span>
              <h2>
                <span className="gradient-cyan">{item.model}</span>
              </h2>
              <p>
                {item.type} · {item.brand} · {item.size}
                {item.verified ? " · verified on real boards" : " · pending verification"}
              </p>
            </div>
          </div>
        </section>

        <div className="wrap">
          <div className="divider" />
        </div>

        <section>
          <div className="wrap">
            <div className="contact-box reveal" style={{ gridTemplateColumns: "1fr" }}>
              <div className="contact-info">
                <span className="eyebrow">BOARD DETAILS</span>
                <h2 style={{ marginTop: 12 }}>{item.model}</h2>
                <p style={{ marginTop: 16 }}>
                  <span className="tag tag-brand">{item.brand}</span>{" "}
                  {item.verified ? (
                    <span className="tag tag-verified">✓ verified</span>
                  ) : null}
                </p>
                <p>
                  Type: <strong>{item.type}</strong>
                  <br />
                  Size: <strong>{item.size}</strong>
                </p>
                <p>
                  This listing mirrors the home library entry. Download and request
                  flows stay on the home library for this demo build.
                </p>
                <div className="hero-actions" style={{ marginBottom: 0 }}>
                  <Link href="/#library" className="btn btn-primary">
                    📚 Back to library
                  </Link>
                  <Link href="/#contact" className="btn btn-outline">
                    📩 Request this board
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollTop />
    </>
  );
}
