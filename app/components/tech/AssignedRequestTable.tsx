"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getTechQueueStats,
  loadAssignedRequests,
  TECH_CHANGE_EVENT,
  typeLabel,
  type TechAssignedRequest,
  type TechPriority,
  type TechRequestType,
  type TechStatus,
} from "../../lib/tech-data";
import { EmptyState, StatCards, StatusBadge, TechPageHeader } from "./ui";

const TYPE_OPTIONS: { value: "" | TechRequestType; label: string }[] = [
  { value: "", label: "All types" },
  { value: "file_request", label: "File request" },
  { value: "support", label: "Support" },
  { value: "upload", label: "Upload verification" },
];

const PRIORITY_OPTIONS: { value: "" | TechPriority; label: string }[] = [
  { value: "", label: "All priorities" },
  { value: "High", label: "High" },
  { value: "Normal", label: "Normal" },
  { value: "Low", label: "Low" },
];

const PENDING_UPLOAD_STATUSES: TechStatus[] = ["Queued", "Needs changes"];

export function AssignedRequestTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type") ?? "";
  const pendingOnly = urlType === "upload";

  const [rowsAll, setRowsAll] = useState<TechAssignedRequest[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState(urlType);
  const [priority, setPriority] = useState("");

  useEffect(() => {
    const sync = () => setRowsAll(loadAssignedRequests());
    sync();
    window.addEventListener(TECH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(TECH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

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
    const set = new Set<TechStatus>();
    rowsAll.forEach((r) => set.add(r.status));
    return Array.from(set);
  }, [rowsAll]);

  const rows = useMemo(() => {
    return rowsAll.filter((r) => {
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        r.id.toLowerCase().includes(query) ||
        r.model.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query) ||
        r.brand.toLowerCase().includes(query);
      const matchS = !status || r.status === status;
      const matchT = !type || r.type === type;
      const matchP = !priority || r.priority === priority;
      const matchPending =
        !pendingOnly ||
        (r.type === "upload" && PENDING_UPLOAD_STATUSES.includes(r.status));
      return matchQ && matchS && matchT && matchP && matchPending;
    });
  }, [rowsAll, q, status, type, priority, pendingOnly]);

  const stats = getTechQueueStats(rowsAll);

  return (
    <>
      <TechPageHeader
        title={pendingOnly ? "Pending verification" : "Assigned requests"}
        description={
          pendingOnly
            ? "Customer uploads waiting for verify, needs-changes, or reject."
            : "File requests, support tickets, and uploads assigned to you."
        }
      />

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
            {pendingOnly ? "Queued + Needs changes" : "All statuses"}
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
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {pendingOnly ? (
          <Link href="/tech" className="btn btn-outline btn-sm">
            Clear filter
          </Link>
        ) : null}
      </div>

      <div className="portal-panel">
        {rows.length === 0 ? (
          <EmptyState
            title={pendingOnly ? "No pending verifications" : "Queue is clear"}
            body={
              pendingOnly
                ? "All uploads are verified or rejected."
                : "No assigned items match these filters."
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
              <QueueRow key={r.id} item={r} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function QueueRow({ item }: { item: TechAssignedRequest }) {
  return (
    <div className="lib-row tech-queue-row">
      <span className="lib-model">{item.id}</span>
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
        {item.updatedAt}
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
        <Link href={`/tech/notes/${item.id}`} className="btn btn-purple btn-sm">
          Notes
        </Link>
        <Link
          href={`/tech/requests/${item.id}/status`}
          className="btn btn-gold btn-sm"
        >
          Status
        </Link>
        <Link href={`/tech/messages/${item.id}`} className="btn btn-success btn-sm">
          Message
        </Link>
      </div>
    </div>
  );
}
