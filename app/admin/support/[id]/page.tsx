"use client";

import { useParams } from "next/navigation";
import { SupportManager } from "../../../components/admin/SupportManager";

export default function AdminSupportDetailPage() {
  const params = useParams<{ id: string }>();
  return <SupportManager detailId={params.id} />;
}
