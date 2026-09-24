"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { StatusBadge, TechPageHeader } from "./ui";

type LiveItem = {
  kind: "request" | "ticket" | "upload";
  id: string;
  displayId: string;
  type: "file_request" | "support" | "upload";
  model: string;
  brand: string;
  status: string;
  description: string;
};

const REQUEST_STATUSES = [
  "pending",
  "assigned",
  "in_progress",
  "needs_info",
  "completed",
  "closed",
  "rejected",
];
const TICKET_STATUSES = [
  "pending",
  "open",
  "assigned",
  "in_progress",
  "waiting_customer",
  "resolved",
  "closed",
];
const UPLOAD_STATUSES = ["pending", "approved", "needs_info", "rejected"];

function statusesFor(type: LiveItem["type"]) {
  if (type === "file_request") return REQUEST_STATUSES;
  if (type === "support") return TICKET_STATUSES;
  return UPLOAD_STATUSES;
}

export function StatusUpdateForm() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<LiveItem | null>(null);
  const [status, setStatus] = useState("");
  const [publicReason, setPublicReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const reqRes = await fetch(`/api/requests/${id}`, {
        credentials: "include",
      });
      if (reqRes.ok) {
        const data = await reqRes.json();
        if (data.request) {
          const r = data.request;
          const live: LiveItem = {
            kind: "request",
            id: r.id,
            displayId: r.requestNumber,
            type: "file_request",
            model: r.boardModel,
            brand: r.brand,
            status: r.status,
            description: r.description || "",
          };
          setItem(live);
          setStatus(r.status);
          return;
        }
        if (data.ticket) {
          const t = data.ticket;
          const live: LiveItem = {
            kind: "ticket",
            id: t.id,
            displayId: t.ticketNumber,
            type: "support",
            model: t.model || t.boardNumber || "—",
            brand: t.brand || "—",
            status: t.status,
            description: t.description || "",
          };
          setItem(live);
          setStatus(t.status);
          return;
        }
      }
      const upRes = await fetch(`/api/uploads/${id}`, {
        credentials: "include",
      });
      if (upRes.ok) {
        const data = await upRes.json();
        const u = data.upload;
        const live: LiveItem = {
          kind: "upload",
          id: u.id,
          displayId: u.id.slice(0, 8),
          type: "upload",
          model: u.boardNumber || u.modelNumber,
          brand: "—",
          status: u.status,
          description: u.notes || "",
        };
        setItem(live);
        setStatus(u.status);
        return;
      }
      setError("Item not found");
      setItem(null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!item || !status) {
      setError("Choose a new status.");
      return;
    }
    setError("");
    setPending(true);
    try {
      if (item.kind === "upload") {
        const res = await fetch(`/api/uploads/${item.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            reviewNote: publicReason.trim(),
            publish: status === "approved",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Save failed");
          return;
        }
      } else {
        const res = await fetch(`/api/requests/${item.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            message: publicReason.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Save failed");
          return;
        }
      }
      setToast(true);
      setTimeout(() => setToast(false), 2200);
      await load();
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return <p style={{ color: "var(--text-muted)" }}>Loading…</p>;
  }

  if (!item) {
    return (
      <>
        <TechPageHeader title="Not found" description={error} />
        <Link href="/tech" className="btn btn-outline btn-sm">
          Back to queue
        </Link>
      </>
    );
  }

  return (
    <>
      <TechPageHeader
        title={`Status · ${item.displayId}`}
        description="Change status and optionally notify the customer."
      />
      <div className="portal-panel" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14 }}>
          {item.model} · {item.brand} · <StatusBadge status={item.status} />
        </p>
        <p style={{ fontSize: 14, marginTop: 8 }}>{item.description || "—"}</p>
      </div>
      <form className="portal-panel" onSubmit={onSubmit} noValidate>
        <h2>Update status</h2>
        <div className="field">
          <label htmlFor="newStatus">New status *</label>
          <select
            id="newStatus"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusesFor(item.type).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="publicReason">Public reason (customer)</label>
          <textarea
            id="publicReason"
            rows={3}
            value={publicReason}
            onChange={(e) => setPublicReason(e.target.value)}
            placeholder="Optional message customer will see"
          />
        </div>
        {error ? (
          <div className="toast show error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        ) : null}
        <div className="action-btns">
          <button type="submit" className="btn btn-success btn-sm" disabled={pending}>
            Save status
          </button>
          {item.type === "support" ? (
            <Link href={`/tech/messages/${item.id}`} className="btn btn-primary btn-sm">
              Open messages
            </Link>
          ) : null}
          <Link href="/tech" className="btn btn-outline btn-sm">
            Queue
          </Link>
        </div>
        <div className={`toast${toast ? " show" : ""}`}>✅ Status updated</div>
      </form>
    </>
  );
}
