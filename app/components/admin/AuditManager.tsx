"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_AUDIT_SEED,
  AUDIT_KEY,
  getAuditEvents,
  saveJson,
  type AdminAuditEvent,
} from "../../lib/admin-data";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminToolbar,
  EmptyState,
} from "./ui";

export function AuditManager() {
  const [rows, setRows] = useState<AdminAuditEvent[]>(ADMIN_AUDIT_SEED);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");

  const refresh = () => setRows(getAuditEvents());

  useEffect(() => {
    refresh();
  }, []);

  const actions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.action))).sort(),
    [rows],
  );
  const actors = useMemo(
    () => Array.from(new Set(rows.map((r) => r.actor))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        r.target.toLowerCase().includes(query) ||
        r.detail.toLowerCase().includes(query) ||
        r.action.toLowerCase().includes(query);
      return matchQ && (!action || r.action === action) && (!actor || r.actor === actor);
    });
  }, [rows, q, action, actor]);

  const clearAll = () => {
    if (!confirm("Clear all audit logs in this browser?")) return;
    saveJson(AUDIT_KEY, ADMIN_AUDIT_SEED);
    refresh();
  };

  return (
    <>
      <AdminPageHeader
        title="Audit Logs"
        description="Who did what, when — seeded events plus actions persisted in localStorage."
      />
      <AdminToolbar>
        <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select value={actor} onChange={(e) => setActor(e.target.value)}>
          <option value="">All actors</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-primary btn-sm" onClick={refresh}>
          Refresh
        </button>
        <button type="button" className="btn btn-danger btn-sm" onClick={clearAll}>
          Reset to seed
        </button>
      </AdminToolbar>
      <AdminPanel title={`Events (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState title="No events" body="Try clearing filters." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-audit">
              <span>When</span>
              <span>Actor</span>
              <span>Action</span>
              <span>Target</span>
              <span>Detail</span>
            </div>
            {filtered.map((r) => (
              <div className="lib-row admin-row-audit" key={r.id}>
                <span className="admin-cell-date">{r.at}</span>
                <span className="admin-cell-muted">{r.actor}</span>
                <span className="admin-cell-muted">{r.action}</span>
                <span className="lib-model">{r.target}</span>
                <span className="admin-cell-muted">{r.detail}</span>
              </div>
            ))}
          </AdminTable>
        )}
      </AdminPanel>
    </>
  );
}
