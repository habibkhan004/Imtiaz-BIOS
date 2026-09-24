"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_PROFILE,
  ADMIN_SUPPORT,
  SUPPORT_KEY,
  TECHNICIAN_OPTIONS,
  appendAudit,
  loadJson,
  saveJson,
  type AdminSupportTicket,
  type SupportStatus,
} from "../../lib/admin-data";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminToolbar,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

const STATUSES: SupportStatus[] = [
  "Open",
  "In progress",
  "Waiting on customer",
  "Resolved",
];

export function SupportManager({ detailId }: { detailId?: string }) {
  const [rows, setRows] = useState<AdminSupportTicket[]>(ADMIN_SUPPORT);
  const [toast, setToast] = useState("");
  const [note, setNote] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setRows(loadJson(SUPPORT_KEY, ADMIN_SUPPORT));
  }, []);

  const persist = (next: AdminSupportTicket[]) => {
    setRows(next);
    saveJson(SUPPORT_KEY, next);
  };

  const detail = detailId ? rows.find((t) => t.id === detailId) : null;

  useEffect(() => {
    if (detail) setNote(detail.adminNote ?? "");
  }, [detail]);

  const filtered = useMemo(() => {
    return rows.filter((t) => {
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        t.id.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.customerName.toLowerCase().includes(query);
      return matchQ && (!status || t.status === status);
    });
  }, [rows, q, status]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2000);
  };

  const patch = (id: string, updates: Partial<AdminSupportTicket>, action: string, detailText: string) => {
    persist(
      rows.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString().slice(0, 10) }
          : t,
      ),
    );
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action,
      target: id,
      detail: detailText,
    });
    flash("Saved");
  };

  if (detailId && !detail) {
    return (
      <EmptyState
        title="Ticket not found"
        body="Unknown support id."
        actionHref="/admin/support"
        actionLabel="Back"
      />
    );
  }

  if (detail) {
    return (
      <>
        <AdminPageHeader
          title={`${detail.id} · ${detail.subject}`}
          description={`${detail.customerName} · ${detail.model} · Priority ${detail.priority}`}
        />
        <div className="portal-grid-2">
          <AdminPanel title="Ticket">
            <p style={{ fontSize: 14, marginBottom: 16 }}>{detail.description}</p>
            <h3 style={{ marginBottom: 10, fontSize: 16 }}>Thread</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {detail.messages.map((m, i) => (
                <div
                  key={`${m.at}-${i}`}
                  style={{
                    padding: 12,
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-card)",
                  }}
                >
                  <div className="admin-cell-date" style={{ marginBottom: 6 }}>
                    {m.from} · {m.at}
                  </div>
                  <div style={{ fontSize: 14 }}>{m.text}</div>
                </div>
              ))}
            </div>
          </AdminPanel>
          <AdminPanel title="Admin controls">
            <div className="field">
              <label>Assign</label>
              <select
                value={detail.assignedTo}
                onChange={(e) =>
                  patch(detail.id, { assignedTo: e.target.value }, "support.assign", e.target.value)
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
                  patch(
                    detail.id,
                    { status: e.target.value as SupportStatus },
                    "support.status",
                    e.target.value,
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
              <label>Internal admin note</label>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="action-btns">
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={() => patch(detail.id, { adminNote: note }, "support.note", "Note saved")}
              >
                Save note
              </button>
              <Link href="/admin/support" className="btn btn-outline btn-sm">
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
        title="Support Tickets"
        description="Global support queue with assignment and status controls."
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
      </AdminToolbar>
      <AdminPanel title={`Tickets (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState title="No tickets" body="Nothing matches." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-support">
              <span>ID</span>
              <span>Subject</span>
              <span>Customer</span>
              <span>Board</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Assigned</span>
              <span>Updated</span>
              <span></span>
            </div>
            {filtered.map((t) => (
              <div className="lib-row admin-row-support" key={t.id}>
                <span className="lib-model">{t.id}</span>
                <span className="admin-cell-muted">{t.subject}</span>
                <span className="admin-cell-muted">{t.customerName}</span>
                <span>{t.model}</span>
                <span>{t.priority}</span>
                <span>
                  <StatusBadge status={t.status} />
                </span>
                <span className="admin-cell-muted">{t.assignedTo}</span>
                <span className="admin-cell-date">{t.updatedAt}</span>
                <div className="action-btns">
                  <Link href={`/admin/support/${t.id}`} className="btn btn-success btn-sm">
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
