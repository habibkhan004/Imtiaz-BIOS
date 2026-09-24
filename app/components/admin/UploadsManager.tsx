"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

type ApiUpload = {
  id: string;
  originalName: string;
  boardNumber: string;
  modelNumber: string;
  brandName?: string;
  fileType: string;
  sizeBytes: number;
  status: string;
  notes: string;
  reviewNote?: string;
  uploaderName?: string;
  uploaderEmail?: string;
  createdAt: string;
  mimeType?: string;
  storageKey?: string;
};

function formatSize(bytes: number) {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function UploadsManager({ detailId }: { detailId?: string }) {
  const [rows, setRows] = useState<ApiUpload[]>([]);
  const [toast, setToast] = useState("");
  const [reason, setReason] = useState("");
  const [publish, setPublish] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/uploads?limit=100", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load uploads");
        return;
      }
      setRows(data.items || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const detail = detailId ? rows.find((r) => r.id === detailId) : null;

  const review = async (
    id: string,
    status: "approved" | "rejected" | "needs_info",
  ) => {
    if ((status === "needs_info" || status === "rejected") && !reason.trim()) {
      flash("Reason required for needs info / reject");
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/uploads/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewNote: reason.trim(),
          publish: status === "approved" ? publish : false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Review failed");
        return;
      }
      flash(
        status === "approved"
          ? publish
            ? "✅ Approved & published to library"
            : "✅ Approved"
          : status === "needs_info"
            ? "⚠️ Needs more info"
            : "❌ Rejected",
      );
      setReason("");
      await load();
    } catch {
      flash("Network error");
    } finally {
      setPending(false);
    }
  };

  if (detailId && !loading && !detail) {
    return (
      <EmptyState
        title="Upload not found"
        body="This upload is not in the live database (old demo IDs like UP-71 no longer apply)."
        actionHref="/admin/uploads"
        actionLabel="Back to uploads"
      />
    );
  }

  if (detail) {
    return (
      <>
        <AdminPageHeader
          title={detail.originalName}
          description={`${detail.boardNumber || detail.modelNumber} · ${detail.brandName || "—"} · ${detail.uploaderName}`}
        />
        <div className="portal-grid-2">
          <AdminPanel
            title="Metadata"
            actions={<StatusBadge status={detail.status} />}
          >
            <p style={{ fontSize: 14 }}>
              Size: <strong>{formatSize(detail.sizeBytes)}</strong>
              <br />
              Type: <strong>{detail.fileType}</strong>
              <br />
              MIME: <strong>{detail.mimeType || "—"}</strong>
              <br />
              Submitted:{" "}
              <strong>{new Date(detail.createdAt).toLocaleString()}</strong>
              <br />
              Uploader:{" "}
              <strong>
                {detail.uploaderName} ({detail.uploaderEmail})
              </strong>
            </p>
            <p style={{ marginTop: 12, fontSize: 14 }}>{detail.notes || "—"}</p>
            {detail.reviewNote ? (
              <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>
                Last review note: {detail.reviewNote}
              </p>
            ) : null}
          </AdminPanel>
          <AdminPanel title="Review actions">
            <label style={{ display: "flex", gap: 8, marginBottom: 14, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
              />
              Publish to public library on approve
            </label>
            <div className="field">
              <label htmlFor="reason">Reason / note</label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Required for Needs info / Reject"
              />
            </div>
            <div className="action-btns" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                type="button"
                className="btn btn-success btn-sm"
                disabled={pending || detail.status === "approved"}
                onClick={() => review(detail.id, "approved")}
              >
                Approve & publish
              </button>
              <button
                type="button"
                className="btn btn-gold btn-sm"
                disabled={pending}
                onClick={() => review(detail.id, "needs_info")}
              >
                Needs info
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={pending}
                onClick={() => review(detail.id, "rejected")}
              >
                Reject
              </button>
              <Link href="/admin/uploads" className="btn btn-outline btn-sm">
                Back
              </Link>
            </div>
          </AdminPanel>
        </div>
        <Toast message={toast} />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Upload Review"
        description="Live customer uploads from MongoDB — approve, request info, or reject."
      />
      {error ? <div className="toast show error">{error}</div> : null}
      <AdminPanel
        title={`Uploads (${rows.length})`}
        actions={
          <button type="button" className="btn btn-outline btn-sm" onClick={load}>
            Refresh
          </button>
        }
      >
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : rows.length === 0 ? (
          <EmptyState title="Queue clear" body="No uploads in the database yet." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-uploads">
              <span>Filename</span>
              <span>Board</span>
              <span>Brand</span>
              <span>Uploaded by</span>
              <span>Submitted</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {rows.map((u) => (
              <div className="lib-row admin-row-uploads" key={u.id}>
                <span className="lib-model">{u.originalName}</span>
                <span>{u.boardNumber || u.modelNumber}</span>
                <span>{u.brandName || "—"}</span>
                <span className="admin-cell-muted">{u.uploaderName}</span>
                <span className="admin-cell-date">
                  {new Date(u.createdAt).toLocaleString()}
                </span>
                <span>
                  <StatusBadge status={u.status} />
                </span>
                <div className="action-btns">
                  <Link href={`/admin/uploads/${u.id}`} className="btn btn-success btn-sm">
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </AdminTable>
        )}
      </AdminPanel>
      <Toast message={toast} />
    </>
  );
}
