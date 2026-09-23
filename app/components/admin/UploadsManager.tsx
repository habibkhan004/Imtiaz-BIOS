"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_FILES,
  ADMIN_PROFILE,
  ADMIN_UPLOADS,
  FILES_KEY,
  UPLOADS_KEY,
  appendAudit,
  loadJson,
  saveJson,
  type AdminFile,
  type AdminUpload,
  type UploadReviewStatus,
} from "../../lib/admin-data";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

export function UploadsManager({ detailId }: { detailId?: string }) {
  const [rows, setRows] = useState<AdminUpload[]>(ADMIN_UPLOADS);
  const [toast, setToast] = useState("");
  const [reason, setReason] = useState("");
  const [publish, setPublish] = useState(true);

  useEffect(() => {
    setRows(loadJson(UPLOADS_KEY, ADMIN_UPLOADS));
  }, []);

  const persist = (next: AdminUpload[]) => {
    setRows(next);
    saveJson(UPLOADS_KEY, next);
  };

  const detail = detailId ? rows.find((r) => r.id === detailId) : null;
  const list = useMemo(
    () =>
      rows.filter((r) =>
        detailId ? true : r.status === "Queued" || r.status === "Needs changes" || true,
      ),
    [rows, detailId],
  );

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const setStatus = (id: string, status: UploadReviewStatus, detailText: string) => {
    if ((status === "Needs changes" || status === "Rejected") && !reason.trim()) {
      flash("Reason required for needs changes / reject");
      return;
    }
    const upload = rows.find((r) => r.id === id);
    persist(rows.map((r) => (r.id === id ? { ...r, status, notes: reason || r.notes } : r)));

    let publishedId = "";
    if (status === "Verified" && publish && upload) {
      publishedId = publishUpload(upload);
    }

    appendAudit({
      actor: ADMIN_PROFILE.name,
      action:
        status === "Verified"
          ? "upload.approve"
          : status === "Needs changes"
            ? "upload.needs_changes"
            : "upload.reject",
      target: id,
      detail: `${detailText}${
        publishedId ? ` · published as ${publishedId}` : publish && status === "Verified" ? " · publish=yes" : ""
      }`,
    });
    flash(
      status === "Verified"
        ? publishedId
          ? `✅ Approved & published (${publishedId})`
          : "✅ Approved"
        : status === "Needs changes"
          ? "⚠️ Needs changes"
          : "❌ Rejected",
    );
    setReason("");
  };

  const publishUpload = (upload: AdminUpload) => {
    const files = loadJson(FILES_KEY, ADMIN_FILES);
    const existing = files.find(
      (f) =>
        f.model.toLowerCase() === upload.model.toLowerCase() &&
        f.type === upload.type &&
        !f.archived,
    );
    const today = new Date().toISOString().slice(0, 10);
    if (existing) {
      const next = files.map((f) =>
        f.id === existing.id
          ? {
              ...f,
              verified: true,
              size: upload.size,
              brand: upload.brand,
              description: upload.notes || f.description,
              updatedAt: today,
            }
          : f,
      );
      saveJson(FILES_KEY, next);
      return existing.id;
    }
    const file: AdminFile = {
      id: `file-${Date.now()}`,
      model: upload.model,
      brand: upload.brand,
      type: upload.type,
      category: "bios-dumps",
      size: upload.size,
      verified: true,
      description: upload.notes || `Published from upload ${upload.filename}`,
      updatedAt: today,
    };
    saveJson(FILES_KEY, [file, ...files]);
    return file.id;
  };

  if (detailId && !detail) {
    return (
      <EmptyState
        title="Upload not found"
        body="Unknown upload id."
        actionHref="/admin/uploads"
        actionLabel="Back to uploads"
      />
    );
  }

  if (detail) {
    return (
      <>
        <AdminPageHeader
          title={detail.filename}
          description={`${detail.model} · ${detail.brand} · uploaded by ${detail.uploadedBy}`}
        />
        <div className="portal-grid-2">
          <AdminPanel
            title="Metadata"
            actions={<StatusBadge status={detail.status} />}
          >
            <p style={{ fontSize: 14 }}>
              Size: <strong>{detail.size}</strong>
              <br />
              Type: <strong>{detail.type}</strong>
              <br />
              Submitted: <strong>{detail.submittedAt}</strong>
              <br />
              Assigned: <strong>{detail.assignedTech ?? "—"}</strong>
            </p>
            <p style={{ marginTop: 12, fontSize: 14 }}>{detail.notes}</p>
            <pre
              style={{
                marginTop: 16,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--accent-cyan)",
                background: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                padding: 14,
                whiteSpace: "pre-wrap",
              }}
            >
              {detail.hexStub}
            </pre>
          </AdminPanel>
          <AdminPanel title="Review actions">
            <label style={{ display: "flex", gap: 8, marginBottom: 14, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
              />
              Publish to admin library (FILES_KEY)
            </label>
            <div className="field">
              <label htmlFor="reason">Reason / note</label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Required for Needs changes / Reject"
              />
            </div>
            <div className="action-btns" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={() => setStatus(detail.id, "Verified", "Approved for library")}
              >
                Approve & publish
              </button>
              <button
                type="button"
                className="btn btn-gold btn-sm"
                onClick={() => setStatus(detail.id, "Needs changes", reason)}
              >
                Needs changes
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setStatus(detail.id, "Rejected", reason)}
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
        description="Approve, request changes, or reject customer dumps. Admin owns publish decisions."
      />
      <AdminPanel title={`Uploads (${list.length})`}>
        {list.length === 0 ? (
          <EmptyState title="Queue clear" body="No uploads to review." />
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
            {list.map((u) => (
              <div className="lib-row admin-row-uploads" key={u.id}>
                <span className="lib-model">{u.filename}</span>
                <span>{u.model}</span>
                <span>{u.brand}</span>
                <span className="admin-cell-muted">{u.uploadedBy}</span>
                <span className="admin-cell-date">{u.submittedAt}</span>
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
