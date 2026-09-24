import { notFound } from "next/navigation";
import { RequestSummaryCard } from "../../../../components/tech/RequestSummaryCard";
import { StatusUpdateForm } from "../../../../components/tech/StatusUpdateForm";
import { TechPageHeader } from "../../../../components/tech/ui";
import { getAssignedRequest } from "../../../../lib/tech-data";

export const metadata = { title: "Request Status" };

export default async function TechStatusPage({
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
        eyebrow="STATUS UPDATE"
        title={`Status · ${item.id}`}
        description="Change request status, leave reasons, and optionally notify the customer."
      />
      <RequestSummaryCard item={item} />
      <StatusUpdateForm item={item} />
    </>
  );
}
