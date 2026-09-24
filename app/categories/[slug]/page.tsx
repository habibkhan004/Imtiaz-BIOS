import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../components/SiteShell";
import {
  CATEGORIES,
  filesInCategory,
  getCategory,
} from "../../lib/site-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  return {
    title: category?.name ?? "Category",
    description: category?.description,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const files = filesInCategory(slug);

  return (
    <SiteShell>
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">CATEGORY</span>
            <h2>
              {category.icon} {category.name}
            </h2>
            <p>{category.description}</p>
            <div className="hero-actions" style={{ marginBottom: 0, marginTop: 16 }}>
              <Link
                href={`/library?category=${encodeURIComponent(slug)}`}
                className="btn btn-outline btn-sm"
              >
                Open in library filters
              </Link>
              <Link href="/categories" className="btn btn-outline btn-sm">
                ← All categories
              </Link>
            </div>
          </div>

          <div className="lib-table">
            <div className="lib-row head">
              <span>Board / Model</span>
              <span>Brand</span>
              <span>Type</span>
              <span>Size</span>
              <span>Actions</span>
            </div>
            {files.length === 0 ? (
              <div className="empty-library">No files in this category yet.</div>
            ) : (
              files.map((item) => (
                <div className="lib-row" key={item.id}>
                  <span className="lib-model">{item.model}</span>
                  <span>
                    <span className="tag tag-brand">{item.brand}</span>
                  </span>
                  <span>{item.type}</span>
                  <span>
                    {item.size}{" "}
                    {item.verified ? (
                      <span className="tag tag-verified">✓ verified</span>
                    ) : null}
                  </span>
                  <div className="action-btns">
                    <Link
                      href={`/library/${item.id}`}
                      className="btn btn-download btn-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
