"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type ReviewItem = {
  kind: "request" | "ticket" | "upload";
  id: string;
  type: "file_request" | "support" | "upload";
  status: string;
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

function statusesFor(type: ReviewItem["type"]) {
  if (type === "file_request") return REQUEST_STATUSES;
  if (type === "support") return TICKET_STATUSES;
  return UPLOAD_STATUSES;
}

export function ReviewForm({
  item,
  onDone,
}: {
  item: ReviewItem;
  onDone?: () => void;
}) {
  const router = useRouter();
  const allowed = statusesFor(item.type);
  const [nextStatus, setNextStatus] = useState(allowed[1] ?? item.status);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError("Internal summary is required.");
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
            status: nextStatus,
            reviewNote: summary.trim(),
            publish: nextStatus === "approved",
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
            status: nextStatus,
            message: summary.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Save failed");
          return;
        }
      }
      setToast(true);
      onDone?.();
      setTimeout(() => router.push(`/tech/requests/${item.id}/status`), 800);
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="portal-panel" onSubmit={onSubmit} noValidate>
      <h2>Review form</h2>
      <div className="field">
        <label htmlFor="nextStatus">Recommended status</label>
        <select
          id="nextStatus"
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value)}
        >
          {allowed.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="summary">Internal / customer note</label>
        <textarea
          id="summary"
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
        />
      </div>
      {error ? (
        <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>
      ) : null}
      {toast ? (
        <p style={{ color: "var(--accent-cyan)", fontSize: 13, marginBottom: 12 }}>
          Saved
        </p>
      ) : null}
      <div className="action-btns">
        <button type="submit" className="btn btn-success btn-sm" disabled={pending}>
          Save review
        </button>
        <Link href="/tech" className="btn btn-outline btn-sm">
          Cancel
        </Link>
      </div>
    </form>
  );
}
