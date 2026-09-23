import { notFound } from "next/navigation";
import { FileDetailClient } from "../../components/library/FileDetailClient";
import { SiteShell } from "../../components/SiteShell";
import { getLibraryFile, LIBRARY_FILES } from "../../lib/site-data";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return LIBRARY_FILES.map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const file = getLibraryFile(id);
  return {
    title: file?.model ?? "File",
    description: file
      ? `${file.type} for ${file.brand} board ${file.model}`
      : "Library file details",
  };
}

export default async function LibraryFilePage({ params }: Props) {
  const { id } = await params;
  const file = getLibraryFile(id);
  if (!file) notFound();

  return (
    <SiteShell>
      <section>
        <FileDetailClient file={file} />
      </section>
    </SiteShell>
  );
}
