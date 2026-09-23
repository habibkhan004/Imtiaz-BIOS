import { notFound } from "next/navigation";
import { VerificationPageClient } from "../../../components/tech/VerificationPageClient";
import {
  getAssignedRequest,
  getVerificationItem,
} from "../../../lib/tech-data";

export const metadata = { title: "File Verification" };

export default async function TechVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getVerificationItem(id);
  const request = getAssignedRequest(item?.requestId ?? id);
  if (!item || !request) notFound();

  return <VerificationPageClient seed={item} requestId={item.requestId} />;
}
