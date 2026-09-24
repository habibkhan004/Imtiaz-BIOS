import { notFound } from "next/navigation";
import { MessageThread } from "../../../components/tech/MessageThread";
import { TechPageHeader } from "../../../components/tech/ui";
import { getAssignedRequest } from "../../../lib/tech-data";

export const metadata = { title: "Customer Messages" };

export default async function TechMessagesPage({
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
        eyebrow="CUSTOMER COMMUNICATION"
        title={`Messages · ${item.id}`}
        description="Mock message thread with the customer. No email or Telegram APIs."
      />
      <MessageThread item={item} />
    </>
  );
}
