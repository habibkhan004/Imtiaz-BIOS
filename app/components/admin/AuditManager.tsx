"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminToolbar,
  EmptyState,
} from "./ui";

type AuditRow = {
  id: string;
  actorId: string;
  actorName?: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: string;
};

export function AuditManager() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [actorId, setActorId] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [actors, setActors] = useState<{ id: string; name: string; email: string }[]>(
    [],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      page: String(page),
      limit: "40",
    });
    if (q.trim()) params.set("q", q.trim());
    if (action) params.set("action", action);
    if (actorId) params.set("actorId", actorId);
    try {
      const res = await fetch(`/api/admin/audit?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load audit log");
        return;
      }
      setRows(data.items || []);
      setTotal(data.total || 0);
      setActions(data.filters?.actions || []);
      setActors(data.filters?.actors || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [page, q, action, actorId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 40));

  return (
    <>
      <AdminPageHeader
        title="Audit Logs"
        description="Append-only record of sensitive admin/tech actions (actor, action, target, time)."
      />
      <AdminToolbar>
        <input
          placeholder="Search…"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <select
          value={action}
          onChange={(e) => {
            setPage(1);
            setAction(e.target.value);
          }}
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={actorId}
          onChange={(e) => {
            setPage(1);
            setActorId(e.target.value);
          }}
        >
          <option value="">All actors</option>
          {actors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-primary btn-sm" onClick={load}>
          Refresh
        </button>
      </AdminToolbar>
      {error ? <div className="toast show error">{error}</div> : null}
      <AdminPanel title={`Events (${total})`}>
        {loading && rows.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No events" body="Try clearing filters or perform an admin action." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-audit">
              <span>When</span>
              <span>Actor</span>
              <span>Action</span>
              <span>Target</span>
              <span>Detail</span>
            </div>
            {rows.map((r) => (
              <div className="lib-row admin-row-audit" key={r.id}>
                <span className="admin-cell-date">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
                <span className="admin-cell-muted">{r.actorName || r.actorId}</span>
                <span className="admin-cell-muted">{r.action}</span>
                <span className="lib-model">
                  {r.targetType}:{r.targetId.slice(0, 8)}
                </span>
                <span className="admin-cell-muted">{r.summary}</span>
              </div>
            ))}
          </AdminTable>
        )}
        <div className="action-btns" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </AdminPanel>
    </>
  );
}
