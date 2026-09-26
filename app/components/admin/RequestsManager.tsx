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

type ApiRequest = {
  id: string;
  requestNumber: string;
  boardModel: string;
  brand: string;
  typeNeeded: string;
  description: string;
  status: string;
  assigneeId?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
  updatedAt: string;
};

type TechUser = { id: string; name: string; email: string };

const STATUSES = [
  "pending",
  "assigned",
  "in_progress",
  "needs_info",
  "completed",
  "closed",
  "rejected",
];

export function RequestsManager({ detailId }: { detailId?: string }) {
  const [rows, setRows] = useState<ApiRequest[]>([]);
  const [techs, setTechs] = useState<TechUser[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [brand, setBrand] = useState("");
  const [assignee, setAssignee] = useState("");
  const [toast, setToast] = useState("");
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
        setError(reqData.error || "Failed to load requests");
        return;
      }
      setRows(reqData.requests?.items || []);
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
    ? rows.find((r) => r.id === detailId || r.requestNumber === detailId)
    : null;

  const brands = useMemo(
    () => Array.from(new Set(rows.map((r) => r.brand).filter(Boolean))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        r.id.toLowerCase().includes(query) ||
        r.requestNumber.toLowerCase().includes(query) ||
        r.boardModel.toLowerCase().includes(query) ||
        (r.customerName || "").toLowerCase().includes(query);
      return (
        matchQ &&
        (!status || r.status === status) &&
        (!brand || r.brand === brand) &&
        (!assignee || r.assigneeId === assignee)
      );
    });
  }, [rows, q, status, brand, assignee]);

  const techName = (id?: string) =>
    techs.find((t) => t.id === id)?.name || (id ? "Assigned" : "—");

  const save = async (id: string, body: { status?: string; assigneeId?: string }) => {
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
      flash("Saved");
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
        title="Request not found"
        body="This ID is not in the live database (seed FR-* ids no longer apply)."
        actionHref="/admin/requests"
        actionLabel="Back to requests"
      />
    );
  }

  if (detail) {
    return (
      <>
        <AdminPageHeader
          title={`${detail.requestNumber} · ${detail.boardModel}`}
          description={`${detail.customerName} · ${detail.brand} · ${detail.typeNeeded}`}
        />
        <div className="portal-grid-2">
          <AdminPanel title="Request detail">
            <p style={{ marginBottom: 12 }}>
              Status: <StatusBadge status={detail.status} />
            </p>
            <p style={{ fontSize: 14, marginBottom: 12 }}>
              {detail.description || "No description"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Customer: {detail.customerName} ({detail.customerEmail})
              <br />
              Created: {new Date(detail.createdAt).toLocaleString()}
              <br />
              Updated: {new Date(detail.updatedAt).toLocaleString()}
            </p>
          </AdminPanel>
          <AdminPanel title="Admin controls">
            <div className="field">
              <label>Assign technician</label>
              <select
                value={detail.assigneeId || ""}
                disabled={pending}
                onChange={(e) =>
                  save(detail.id, { assigneeId: e.target.value || undefined, status: e.target.value ? "assigned" : detail.status })
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
            <div className="action-btns">
              <button type="button" className="btn btn-outline btn-sm" onClick={load}>
                Refresh
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
        description="Live file-request queue from MongoDB — assign technicians and update status."
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
        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">All assignees</option>
          {techs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-outline btn-sm" onClick={load}>
          Refresh
        </button>
      </AdminToolbar>
      <AdminPanel title={`Requests (${filtered.length})`}>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="No requests" body="Clear filters or wait for portal submissions." />
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
                <span className="lib-model">{r.requestNumber}</span>
                <span className="admin-cell-muted">{r.customerName}</span>
                <span>{r.boardModel}</span>
                <span>{r.brand}</span>
                <span className="admin-cell-muted">{r.typeNeeded}</span>
                <span>
                  <StatusBadge status={r.status} />
                </span>
                <span className="admin-cell-muted">{techName(r.assigneeId)}</span>
                <span className="admin-cell-date">
                  {new Date(r.updatedAt).toLocaleString()}
                </span>
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
