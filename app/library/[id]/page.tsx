import { notFound } from "next/navigation";
import { FileDetailClient } from "../../components/library/FileDetailClient";
import { SiteShell } from "../../components/SiteShell";
import { getLibraryFile, LIBRARY_FILES, type LibraryFile } from "../../lib/site-data";
import { loadDb } from "../../lib/server/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return LIBRARY_FILES.map((f) => ({ id: f.id }));
}

function formatSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const staticFile = getLibraryFile(id);
  if (staticFile) {
    return {
      title: staticFile.model,
      description: `${staticFile.type} for ${staticFile.brand} board ${staticFile.model}`,
    };
  }
  try {
    const db = await loadDb();
    const f = db.files.find((x) => x.id === id);
    if (f) {
      return {
        title: f.modelNumber || f.name,
        description: f.description,
      };
    }
  } catch {
    /* ignore */
  }
  return { title: "File", description: "Library file details" };
}

export default async function LibraryFilePage({ params }: Props) {
  const { id } = await params;
  let file: LibraryFile | undefined = getLibraryFile(id);
  let apiFileId: string | undefined;

  if (!file) {
    const db = await loadDb();
    const f = db.files.find((x) => x.id === id && x.status === "published");
    if (!f) notFound();
    const brand = db.brands.find((b) => b.id === f.brandId);
    const category = db.categories.find((c) => c.id === f.categoryId);
    apiFileId = f.id;
    file = {
      id: f.id,
      model: f.modelNumber || f.boardNumber || f.name,
      brand: brand?.name || "Other",
      type: f.fileType as LibraryFile["type"],
      category: category?.slug || "other",
      size: formatSize(f.sizeBytes),
      verified: f.verificationStatus === "verified",
      description: f.description,
    };
  }

  return (
    <SiteShell>
      <section>
        <FileDetailClient file={file} apiFileId={apiFileId ?? file.id} />
      </section>
    </SiteShell>
  );
}
