"use client";

import { useParams } from "next/navigation";
import { RequestsManager } from "../../../components/admin/RequestsManager";

export default function AdminRequestDetailPage() {
  const params = useParams<{ id: string }>();
  return <RequestsManager detailId={params.id} />;
}
