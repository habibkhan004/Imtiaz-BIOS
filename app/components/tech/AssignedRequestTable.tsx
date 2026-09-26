"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, StatCards, StatusBadge, TechPageHeader } from "./ui";

type QueueItem = {
  id: string;
  displayId: string;
  type: "file_request" | "support" | "upload";
  model: string;
  brand: string;
  customerName: string;
  priority: string;
  status: string;
  updatedAt: string;
};

const TYPE_OPTIONS: { value: "" | QueueItem["type"]; label: string }[] = [
  { value: "", label: "All types" },
  { value: "file_request", label: "File request" },
  { value: "support", label: "Support" },
  { value: "upload", label: "Upload verification" },
];

const PENDING_UPLOAD = new Set(["pending", "needs_info"]);

function typeLabel(type: QueueItem["type"]) {
  if (type === "file_request") return "File request";
  if (type === "support") return "Support";
  return "Upload verification";
}

export function AssignedRequestTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type") ?? "";
  const pendingOnly = urlType === "upload";

  const [rowsAll, setRowsAll] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState(urlType);
  const [priority, setPriority] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [uploadsRes, reqRes] = await Promise.all([
        fetch("/api/admin/uploads?limit=100", { credentials: "include" }),
        fetch("/api/admin/requests?limit=100", { credentials: "include" }),
      ]);
      const uploadsData = await uploadsRes.json();
      const reqData = await reqRes.json();
      if (!uploadsRes.ok || !reqRes.ok) {
        setError(
          uploadsData.error || reqData.error || "Failed to load tech queue",
        );
        return;
      }

      const uploads: QueueItem[] = (uploadsData.items || []).map(
        (u: {
          id: string;
          boardNumber?: string;
          modelNumber?: string;
          brandName?: string;
          uploaderName?: string;
          status: string;
          updatedAt?: string;
          createdAt: string;
        }) => ({
          id: u.id,
          displayId: u.id.slice(0, 8),
          type: "upload" as const,
          model: u.boardNumber || u.modelNumber || "—",
          brand: u.brandName || "—",
          customerName: u.uploaderName || "Unknown",
          priority: "Normal",
          status: u.status,
          updatedAt: u.updatedAt || u.createdAt,
        }),
      );

      const requests: QueueItem[] = (reqData.requests?.items || []).map(
        (r: {
          id: string;
          requestNumber: string;
          boardModel: string;
          brand: string;
          customerName?: string;
          status: string;
          updatedAt: string;
        }) => ({
          id: r.id,
          displayId: r.requestNumber,
          type: "file_request" as const,
          model: r.boardModel,
          brand: r.brand,
          customerName: r.customerName || "Unknown",
          priority: "Normal",
          status: r.status,
          updatedAt: r.updatedAt,
        }),
      );

      const tickets: QueueItem[] = (reqData.tickets?.items || []).map(
        (t: {
          id: string;
          ticketNumber: string;
          model?: string;
          boardNumber?: string;
          brand?: string;
          customerName?: string;
          priority: string;
          status: string;
          updatedAt: string;
        }) => ({
          id: t.id,
          displayId: t.ticketNumber,
          type: "support" as const,
          model: t.model || t.boardNumber || "—",
          brand: t.brand || "—",
          customerName: t.customerName || "Guest",
          priority: t.priority,
          status: t.status,
          updatedAt: t.updatedAt,
        }),
      );

      setRowsAll(
        [...uploads, ...requests, ...tickets].sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt),
        ),
      );
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setType(urlType);
    if (urlType === "upload") setStatus("");
  }, [urlType]);

  const setTypeFilter = (next: string) => {
    setType(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("type", next);
    else params.delete("type");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const statuses = useMemo(() => {
    const set = new Set<string>();
    rowsAll.forEach((r) => set.add(r.status));
    return Array.from(set);
  }, [rowsAll]);

  const rows = useMemo(() => {
    return rowsAll.filter((r) => {
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        r.id.toLowerCase().includes(query) ||
        r.displayId.toLowerCase().includes(query) ||
        r.model.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query) ||
        r.brand.toLowerCase().includes(query);
      const matchS = !status || r.status === status;
      const matchT = !type || r.type === type;
      const matchP =
        !priority || r.priority.toLowerCase() === priority.toLowerCase();
      const matchPending =
        !pendingOnly || (r.type === "upload" && PENDING_UPLOAD.has(r.status));
      return matchQ && matchS && matchT && matchP && matchPending;
    });
  }, [rowsAll, q, status, type, priority, pendingOnly]);

  const stats = useMemo(() => {
    const open = new Set([
      "pending",
      "open",
      "assigned",
      "in_progress",
      "needs_info",
      "waiting_customer",
    ]);
    return {
      assignedOpen: rowsAll.filter((r) => open.has(r.status)).length,
      inReview: rowsAll.filter(
        (r) => r.status === "in_progress" || r.status === "assigned",
      ).length,
      awaitingCustomer: rowsAll.filter(
        (r) => r.status === "waiting_customer" || r.status === "needs_info",
      ).length,
      verificationsPending: rowsAll.filter(
        (r) => r.type === "upload" && PENDING_UPLOAD.has(r.status),
      ).length,
    };
  }, [rowsAll]);

  return (
    <>
      <TechPageHeader
        title={pendingOnly ? "Pending verification" : "Assigned requests"}
        description={
          pendingOnly
            ? "Customer uploads waiting for verify, needs-info, or reject."
            : "Live file requests, support tickets, and uploads from MongoDB."
        }
      />

      {error ? <div className="toast show error">{error}</div> : null}

      <StatCards
        items={[
          { label: "Assigned open", value: stats.assignedOpen },
          { label: "In review", value: stats.inReview },
          { label: "Awaiting customer", value: stats.awaitingCustomer },
          { label: "Verifications pending", value: stats.verificationsPending },
        ]}
      />

      <div className="lib-toolbar" style={{ marginBottom: 16 }}>
        <input
          placeholder="Search ID, board, customer…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search assigned requests"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          disabled={pendingOnly}
        >
          <option value="">
            {pendingOnly ? "pending + needs_info" : "All statuses"}
          </option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by type"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          <option value="urgent">urgent</option>
          <option value="high">high</option>
          <option value="normal">normal</option>
          <option value="low">low</option>
        </select>
        <button type="button" className="btn btn-outline btn-sm" onClick={load}>
          Refresh
        </button>
        {pendingOnly ? (
          <Link href="/tech" className="btn btn-outline btn-sm">
            Clear filter
          </Link>
        ) : null}
      </div>

      <div className="portal-panel">
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading queue…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title={pendingOnly ? "No pending verifications" : "Queue is clear"}
            body={
              pendingOnly
                ? "All uploads are approved or rejected."
                : "No items match these filters."
            }
            actionHref="/tech"
            actionLabel="Show all requests"
          />
        ) : (
          <div className="lib-table tech-queue-table">
            <div className="lib-row head tech-queue-row">
              <span>ID</span>
              <span>Type</span>
              <span>Board</span>
              <span>Brand</span>
              <span>Customer</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Updated</span>
              <span>Actions</span>
            </div>
            {rows.map((r) => (
              <QueueRow key={`${r.type}-${r.id}`} item={r} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function QueueRow({ item }: { item: QueueItem }) {
  return (
    <div className="lib-row tech-queue-row">
      <span className="lib-model">{item.displayId}</span>
      <span>{typeLabel(item.type)}</span>
      <span>{item.model}</span>
      <span>
        <span className="tag tag-brand">{item.brand}</span>
      </span>
      <span style={{ fontSize: 13 }}>{item.customerName}</span>
      <span>{item.priority}</span>
      <span>
        <StatusBadge status={item.status} />
      </span>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
        {new Date(item.updatedAt).toLocaleString()}
      </span>
      <div className="action-btns" style={{ flexWrap: "wrap" }}>
        <Link href={`/tech/review/${item.id}`} className="btn btn-success btn-sm">
          Review
        </Link>
        {item.type === "upload" ? (
          <Link
            href={`/tech/verification/${item.id}`}
            className="btn btn-primary btn-sm"
          >
            Verify
          </Link>
        ) : null}
        <Link
          href={`/tech/requests/${item.id}/status`}
          className="btn btn-gold btn-sm"
        >
          Status
        </Link>
        {item.type === "support" ? (
          <Link href={`/tech/messages/${item.id}`} className="btn btn-success btn-sm">
            Message
          </Link>
        ) : null}
      </div>
    </div>
  );
}
