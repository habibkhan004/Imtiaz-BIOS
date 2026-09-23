"use client";

import { useParams } from "next/navigation";
import { UploadsManager } from "../../../components/admin/UploadsManager";

export default function AdminUploadDetailPage() {
  const params = useParams<{ id: string }>();
  return <UploadsManager detailId={params.id} />;
}
