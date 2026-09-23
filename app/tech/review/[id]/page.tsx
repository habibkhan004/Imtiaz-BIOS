import { notFound } from "next/navigation";
import { ReviewPageClient } from "../../../components/tech/ReviewPageClient";
import { getAssignedRequest } from "../../../lib/tech-data";

export const metadata = { title: "Technical Review" };

export default async function TechReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getAssignedRequest(id);
  if (!item) notFound();
  return <ReviewPageClient seed={item} />;
}
