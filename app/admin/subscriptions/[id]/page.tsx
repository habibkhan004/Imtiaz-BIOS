"use client";

import { useParams } from "next/navigation";
import { SubscriptionsManager } from "../../../components/admin/SubscriptionsManager";

export default function AdminSubscriptionDetailPage() {
  const params = useParams<{ id: string }>();
  return <SubscriptionsManager detailId={params.id} />;
}
