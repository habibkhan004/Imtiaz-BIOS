import { notFound } from "next/navigation";
import { NotesEditor } from "../../../components/tech/NotesEditor";
import { RequestSummaryCard } from "../../../components/tech/RequestSummaryCard";
import { TechPageHeader } from "../../../components/tech/ui";
import { getAssignedRequest } from "../../../lib/tech-data";

export const metadata = { title: "Technical Notes" };

export default async function TechNotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getAssignedRequest(id);
  if (!item) notFound();

  return (
    <>
      <TechPageHeader
        eyebrow="TECHNICAL NOTES"
        title={`Notes · ${item.id}`}
        description="Internal and customer-visible notes for this assignment."
      />
      <RequestSummaryCard item={item} />
      <NotesEditor requestId={item.id} />
    </>
  );
}
