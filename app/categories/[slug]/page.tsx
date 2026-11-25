import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../components/SiteShell";
import { fileFormatFromName } from "../../lib/file-format";
import {
  CATEGORIES,
  filesInCategory,
  getCategory,
  libraryFileIsFree,
  libraryFileName,
  libraryFilePriceLabel,
  type LibraryFile,
} from "../../lib/site-data";
import { loadDb } from "../../lib/server/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

type CategoryFileRow = {
  id: string;
  name: string;
  originalName?: string;
  model: string;
  brand: string;
  type: string;
  size: string;
  verified: boolean;
  accessType: "free" | "paid";
  price: number;
};

function formatSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function staticToRow(f: LibraryFile, index: number): CategoryFileRow {
  const paidDefault = index % 3 === 0;
  const accessType =
    f.accessType ?? (paidDefault ? "paid" : "free");
  const price =
    f.price ??
    (accessType === "paid" ? Number((9.99 + (index % 4) * 3).toFixed(2)) : 0);
  return {
    id: f.id,
    name: libraryFileName(f),
    originalName: f.originalName,
    model: f.model,
    brand: f.brand,
    type: f.type,
    size: f.size,
    verified: f.verified,
    accessType: libraryFileIsFree({ accessType, price }) ? "free" : "paid",
    price: libraryFileIsFree({ accessType, price }) ? 0 : price,
  };
}

async function loadCategoryRows(slug: string): Promise<CategoryFileRow[]> {
  const staticRows = filesInCategory(slug).map(staticToRow);
  try {
    const db = await loadDb();
    const cat = db.categories.find((c) => c.slug === slug);
    if (!cat) return staticRows;
    const apiRows: CategoryFileRow[] = db.files
      .filter((f) => f.status === "published" && f.categoryId === cat.id)
      .map((f) => {
        const brand = db.brands.find((b) => b.id === f.brandId);
        const free = f.accessType === "free" || !(f.price > 0);
        return {
          id: f.id,
          name: f.name,
          originalName: f.originalName,
          model: f.boardNumber || f.modelNumber || f.name,
          brand: brand?.name || "—",
          type: f.fileType,
          size: formatSize(f.sizeBytes),
          verified: f.verificationStatus === "verified",
          accessType: free ? "free" : "paid",
          price: free ? 0 : Number(f.price),
        };
      });
    if (!apiRows.length) return staticRows;
    const apiModels = new Set(apiRows.map((r) => r.model.toLowerCase()));
    return [
      ...apiRows,
      ...staticRows.filter((r) => !apiModels.has(r.model.toLowerCase())),
    ];
  } catch {
    return staticRows;
  }
}

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
  const files = await loadCategoryRows(slug);

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

          <div className="lib-table category-files-table">
            <div className="lib-row head category-files-row">
              <span>Ser No</span>
              <span>File name</span>
              <span>Board / Model</span>
              <span>Brand</span>
              <span>Type</span>
              <span>Size</span>
              <span>Price</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {files.length === 0 ? (
              <div className="empty-library">No files in this category yet.</div>
            ) : (
              files.map((item, index) => {
                const free = libraryFileIsFree(item);
                const format = fileFormatFromName(
                  item.originalName,
                  item.name,
                );
                return (
                  <div className="lib-row category-files-row" key={item.id}>
                    <span className="lib-serno" data-label="Ser No">
                      {index + 1}
                    </span>
                    <span className="lib-filename" data-label="File name">
                      <Link href={`/library/${item.id}`}>{item.name}</Link>
                    </span>
                    <span className="lib-model" data-label="Board / Model">
                      {item.model}
                    </span>
                    <span data-label="Brand">
                      <span className="tag tag-brand">{item.brand}</span>
                    </span>
                    <span data-label="Type">
                      {item.type}{" "}
                      <span
                        className={`file-format-badge tone-${format.tone} is-sm`}
                      >
                        {format.label}
                      </span>
                    </span>
                    <span data-label="Size">{item.size}</span>
                    <span data-label="Price">
                      {free ? (
                        <span className="tag tag-free">Free</span>
                      ) : (
                        <span className="tag tag-price">
                          {libraryFilePriceLabel(item)}
                        </span>
                      )}
                    </span>
                    <span data-label="Status">
                      {item.verified ? (
                        <span className="tag tag-verified">Verified</span>
                      ) : (
                        <span className="tag tag-unverified">Unverified</span>
                      )}
                    </span>
                    <div className="action-btns" data-label="Action">
                      <Link
                        href={`/library/${item.id}`}
                        className="btn btn-download btn-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
