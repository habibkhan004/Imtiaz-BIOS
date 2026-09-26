"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { VerificationForm } from "./VerificationForm";
import { StatusBadge, TechPageHeader } from "./ui";

type LiveUpload = {
  id: string;
  originalName: string;
  boardNumber: string;
  modelNumber: string;
  brandName?: string;
  fileType: string;
  sizeBytes: number;
  status: string;
  notes: string;
  uploaderName?: string;
  createdAt: string;
  reviewNote?: string;
};

function formatSize(bytes: number) {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function VerificationPageClient() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<LiveUpload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/uploads/${id}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload not found");
        setItem(null);
        return;
      }
      const u = data.upload;
      // Enrich brand/uploader from admin list if available
      const listRes = await fetch("/api/admin/uploads?limit=100", {
        credentials: "include",
      });
      const listData = await listRes.json();
      const enriched = (listData.items || []).find(
        (x: { id: string }) => x.id === u.id,
      );
      setItem({
        ...u,
        brandName: enriched?.brandName,
        uploaderName: enriched?.uploaderName,
      });
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p style={{ color: "var(--text-muted)" }}>Loading upload…</p>;
  }

  if (error || !item) {
    return (
      <>
        <TechPageHeader title="Upload not found" description={error} />
        <Link href="/tech?type=upload" className="btn btn-outline btn-sm">
          Back to queue
        </Link>
      </>
    );
  }

  return (
    <>
      <TechPageHeader
        title={`Verify ${item.originalName}`}
        description="Inspect metadata and mark the dump approved, needs info, or rejected."
      />
      <div className="portal-grid-2">
        <div>
          <div className="portal-panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <h2 style={{ marginBottom: 0 }}>{item.originalName}</h2>
              <StatusBadge status={item.status} />
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              {item.boardNumber || item.modelNumber} · {item.brandName || "—"} ·{" "}
              {item.fileType}
            </p>
            <p style={{ fontSize: 14, marginTop: 10 }}>
              Size: <strong>{formatSize(item.sizeBytes)}</strong>
              <br />
              Uploaded by: <strong>{item.uploaderName || "—"}</strong>
              <br />
              Submitted:{" "}
              <strong>{new Date(item.createdAt).toLocaleString()}</strong>
            </p>
            {item.notes ? (
              <p style={{ marginTop: 12, fontSize: 14 }}>{item.notes}</p>
            ) : null}
          </div>
        </div>
        <VerificationForm upload={item} onDone={load} />
      </div>
    </>
  );
}
