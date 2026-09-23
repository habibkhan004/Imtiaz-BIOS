"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_PROFILE,
  ADMIN_REQUESTS,
  REQUESTS_KEY,
  TECHNICIAN_OPTIONS,
  appendAudit,
  loadJson,
  saveJson,
  type AdminRequest,
  type RequestStatus,
} from "../../lib/admin-data";
import { FILTER_BRANDS } from "../../lib/site-data";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminToolbar,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

const STATUSES: RequestStatus[] = ["Pending", "In review", "Fulfilled", "Rejected"];

export function RequestsManager({ detailId }: { detailId?: string }) {
  const [rows, setRows] = useState<AdminRequest[]>(ADMIN_REQUESTS);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [brand, setBrand] = useState("");
  const [assignee, setAssignee] = useState("");
  const [toast, setToast] = useState("");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    setRows(loadJson(REQUESTS_KEY, ADMIN_REQUESTS));
  }, []);

  const persist = (next: AdminRequest[]) => {
    setRows(next);
    saveJson(REQUESTS_KEY, next);
  };

  const detail = detailId ? rows.find((r) => r.id === detailId) : null;

  useEffect(() => {
    if (detail) setAdminNote(detail.adminNote ?? "");
  }, [detail]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        r.id.toLowerCase().includes(query) ||
        r.model.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query);
      return (
        matchQ &&
        (!status || r.status === status) &&
        (!brand || r.brand === brand) &&
        (!assignee || r.assignedTo === assignee)
      );
    });
  }, [rows, q, status, brand, assignee]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2000);
  };

  const updateDetail = (patch: Partial<AdminRequest>, action: string, detailText: string) => {
    if (!detail) return;
    const next = rows.map((r) => {
      if (r.id !== detail.id) return r;
      const updated = { ...r, ...patch, updatedAt: new Date().toISOString().slice(0, 10) };
      if (patch.status && patch.status !== r.status) {
        updated.timeline = [
          ...r.timeline,
          { at: updated.updatedAt, text: `Status → ${patch.status}` },
        ];
      }
      return updated;
    });
    persist(next);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action,
      target: detail.id,
      detail: detailText,
    });
    flash("Saved");
  };

  if (detailId && !detail) {
    return (
      <EmptyState
        title="Request not found"
        body="Unknown request id."
        actionHref="/admin/requests"
        actionLabel="Back"
      />
    );
  }

  if (detail) {
    return (
      <>
        <AdminPageHeader
          title={`${detail.id} · ${detail.model}`}
          description={`${detail.customerName} · ${detail.brand} · ${detail.typeNeeded}`}
        />
        <div className="portal-grid-2">
          <AdminPanel title="Request detail">
            <p style={{ marginBottom: 12 }}>
              Status: <StatusBadge status={detail.status} />
            </p>
            <p style={{ fontSize: 14, marginBottom: 12 }}>{detail.notes}</p>
            <h3 style={{ marginBottom: 10, fontSize: 16 }}>Timeline</h3>
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
              {detail.timeline.map((t, i) => (
                <li key={`${t.at}-${i}`} style={{ borderLeft: "2px solid var(--accent-cyan)", paddingLeft: 12 }}>
                  <div className="admin-cell-date">{t.at}</div>
                  <div style={{ fontSize: 14 }}>{t.text}</div>
                </li>
              ))}
            </ul>
            <p className="form-note" style={{ marginTop: 16 }}>
              Tech path (optional): /tech/review/{detail.id}
            </p>
          </AdminPanel>
          <AdminPanel title="Admin controls">
            <div className="field">
              <label>Assign technician</label>
              <select
                value={detail.assignedTo}
                onChange={(e) =>
                  updateDetail(
                    { assignedTo: e.target.value },
                    "request.assign",
                    `Assigned to ${e.target.value}`,
                  )
                }
              >
                {TECHNICIAN_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select
                value={detail.status}
                onChange={(e) =>
                  updateDetail(
                    { status: e.target.value as RequestStatus },
                    "request.status",
                    `Status ${e.target.value}`,
                  )
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Admin note</label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
            <div className="action-btns">
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={() =>
                  updateDetail({ adminNote }, "request.note", "Admin note updated")
                }
              >
                Save note
              </button>
              <Link href="/admin/requests" className="btn btn-outline btn-sm">
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
        title="File Requests"
        description="Global file-request queue — assign technicians and update status."
      />
      <AdminToolbar>
        <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All brands</option>
          {FILTER_BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">All assignees</option>
          {TECHNICIAN_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </AdminToolbar>
      <AdminPanel title={`Requests (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState title="No requests" body="Clear filters to see more." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-requests">
              <span>ID</span>
              <span>Customer</span>
              <span>Board</span>
              <span>Brand</span>
              <span>Type</span>
              <span>Status</span>
              <span>Assigned</span>
              <span>Updated</span>
              <span></span>
            </div>
            {filtered.map((r) => (
              <div className="lib-row admin-row-requests" key={r.id}>
                <span className="lib-model">{r.id}</span>
                <span className="admin-cell-muted">{r.customerName}</span>
                <span>{r.model}</span>
                <span>{r.brand}</span>
                <span className="admin-cell-muted">{r.typeNeeded}</span>
                <span>
                  <StatusBadge status={r.status} />
                </span>
                <span className="admin-cell-muted">{r.assignedTo}</span>
                <span className="admin-cell-date">{r.updatedAt}</span>
                <div className="action-btns">
                  <Link href={`/admin/requests/${r.id}`} className="btn btn-success btn-sm">
                    Open
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
