"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminToolbar,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

type ApiTicket = {
  id: string;
  ticketNumber: string;
  type: string;
  subject: string;
  brand?: string;
  model?: string;
  boardNumber?: string;
  description: string;
  priority: string;
  status: string;
  assigneeId?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiMessage = {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
};

type TechUser = { id: string; name: string };

const STATUSES = [
  "pending",
  "open",
  "assigned",
  "in_progress",
  "waiting_customer",
  "resolved",
  "closed",
];

export function SupportManager({ detailId }: { detailId?: string }) {
  const [rows, setRows] = useState<ApiTicket[]>([]);
  const [techs, setTechs] = useState<TechUser[]>([]);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [toast, setToast] = useState("");
  const [reply, setReply] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [reqRes, techRes] = await Promise.all([
        fetch("/api/admin/requests?limit=100", { credentials: "include" }),
        fetch("/api/admin/users?role=technician&limit=50", {
          credentials: "include",
        }),
      ]);
      const reqData = await reqRes.json();
      if (!reqRes.ok) {
        setError(reqData.error || "Failed to load tickets");
        return;
      }
      setRows(reqData.tickets?.items || []);
      if (techRes.ok) {
        const techData = await techRes.json();
        setTechs(techData.items || []);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const detail = detailId
    ? rows.find((t) => t.id === detailId || t.ticketNumber === detailId)
    : null;

  useEffect(() => {
    if (!detail) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/requests/${detail.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setMessages(data.messages || []);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detail]);

  const filtered = useMemo(() => {
    return rows.filter((t) => {
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        t.id.toLowerCase().includes(query) ||
        t.ticketNumber.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        (t.customerName || "").toLowerCase().includes(query);
      return matchQ && (!status || t.status === status);
    });
  }, [rows, q, status]);

  const techName = (id?: string) =>
    techs.find((t) => t.id === id)?.name || (id ? "Assigned" : "—");

  const save = async (
    id: string,
    body: { status?: string; assigneeId?: string; message?: string },
  ) => {
    setPending(true);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Save failed");
        return;
      }
      flash(body.message ? "Reply sent" : "Saved");
      setReply("");
      await load();
      if (data.messages) setMessages(data.messages);
      else {
        const refresh = await fetch(`/api/requests/${id}`, {
          credentials: "include",
        });
        const refreshed = await refresh.json();
        if (refresh.ok) setMessages(refreshed.messages || []);
      }
    } catch {
      flash("Network error");
    } finally {
      setPending(false);
    }
  };

  if (detailId && !loading && !detail) {
    return (
      <EmptyState
        title="Ticket not found"
        body="This ID is not in the live database."
        actionHref="/admin/support"
        actionLabel="Back"
      />
    );
  }

  if (detail) {
    return (
      <>
        <AdminPageHeader
          title={`${detail.ticketNumber} · ${detail.subject}`}
          description={`${detail.customerName} · ${detail.model || detail.boardNumber || "—"} · ${detail.priority}`}
        />
        <div className="portal-grid-2">
          <AdminPanel title="Ticket">
            <p style={{ fontSize: 14, marginBottom: 16 }}>{detail.description}</p>
            <h3 style={{ marginBottom: 10, fontSize: 16 }}>Thread</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {messages.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No messages yet.</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: 12,
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-card)",
                    }}
                  >
                    <div className="admin-cell-date" style={{ marginBottom: 6 }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 14 }}>{m.message}</div>
                  </div>
                ))
              )}
            </div>
          </AdminPanel>
          <AdminPanel title="Admin controls">
            <div className="field">
              <label>Assign</label>
              <select
                value={detail.assigneeId || ""}
                disabled={pending}
                onChange={(e) =>
                  save(detail.id, {
                    assigneeId: e.target.value || undefined,
                    status: e.target.value ? "assigned" : detail.status,
                  })
                }
              >
                <option value="">Unassigned</option>
                {techs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select
                value={detail.status}
                disabled={pending}
                onChange={(e) => save(detail.id, { status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Reply to customer</label>
              <textarea
                rows={3}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Visible to the customer"
              />
            </div>
            <div className="action-btns">
              <button
                type="button"
                className="btn btn-success btn-sm"
                disabled={pending || !reply.trim()}
                onClick={() => save(detail.id, { message: reply.trim() })}
              >
                Send reply
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
        description="Live support queue from MongoDB — assign, update status, and reply."
      />
      {error ? <div className="toast show error">{error}</div> : null}
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
        <button type="button" className="btn btn-outline btn-sm" onClick={load}>
          Refresh
        </button>
      </AdminToolbar>
      <AdminPanel title={`Tickets (${filtered.length})`}>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : filtered.length === 0 ? (
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
                <span className="lib-model">{t.ticketNumber}</span>
                <span className="admin-cell-muted">{t.subject}</span>
                <span className="admin-cell-muted">{t.customerName}</span>
                <span>{t.model || t.boardNumber || "—"}</span>
                <span>{t.priority}</span>
                <span>
                  <StatusBadge status={t.status} />
                </span>
                <span className="admin-cell-muted">{techName(t.assigneeId)}</span>
                <span className="admin-cell-date">
                  {new Date(t.updatedAt).toLocaleString()}
                </span>
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
