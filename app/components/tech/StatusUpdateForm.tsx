"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  allowedStatuses,
  appendSystemMessage,
  loadAssignedRequest,
  patchAssignedRequest,
  TECH_CHANGE_EVENT,
  type TechAssignedRequest,
  type TechStatus,
} from "../../lib/tech-data";
import { StatusBadge } from "./ui";

export function StatusUpdateForm({ item: seed }: { item: TechAssignedRequest }) {
  const [item, setItem] = useState(seed);
  const [status, setStatus] = useState<TechStatus>(seed.status);
  const [publicReason, setPublicReason] = useState("");
  const [internalReason, setInternalReason] = useState("");
  const [notify, setNotify] = useState(true);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = () => {
      const live = loadAssignedRequest(seed.id);
      if (live) {
        setItem(live);
        setStatus(live.status);
      }
    };
    sync();
    window.addEventListener(TECH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(TECH_CHANGE_EVENT, sync);
  }, [seed.id]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!status) {
      setError("Choose a new status.");
      return;
    }
    if (!allowedStatuses(item.type).includes(status)) {
      setError("That status is not allowed for this request type.");
      return;
    }
    setError("");
    const at = new Date().toISOString().slice(0, 16).replace("T", " ");
    const text = `Status → ${status}${publicReason ? `: ${publicReason}` : ""}${
      internalReason ? ` (internal: ${internalReason})` : ""
    }`;
    const nextTimeline = [...item.timeline, { at, text }];
    patchAssignedRequest(item.id, {
      status,
      updatedAt: at,
      timeline: nextTimeline,
    });
    if (notify) {
      appendSystemMessage(
        item.id,
        publicReason.trim() || `Status updated to ${status}`,
      );
    }
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  };

  return (
    <div className="portal-grid-2">
      <form className="portal-panel" onSubmit={onSubmit} noValidate>
        <h2>Update status</h2>
        <p style={{ marginBottom: 14, fontSize: 14 }}>
          Current: <StatusBadge status={item.status} />
        </p>
        <div className="field">
          <label htmlFor="newStatus">New status *</label>
          <select
            id="newStatus"
            value={status}
            onChange={(e) => setStatus(e.target.value as TechStatus)}
          >
            {allowedStatuses(item.type).map((s) => (
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
        <div className="field">
          <label htmlFor="internalReason">Internal reason</label>
          <textarea
            id="internalReason"
            rows={2}
            value={internalReason}
            onChange={(e) => setInternalReason(e.target.value)}
            placeholder="Optional, technicians only"
          />
        </div>
        <label
          style={{
            display: "flex",
            gap: 8,
            fontSize: 14,
            marginBottom: 16,
            color: "var(--text-secondary)",
          }}
        >
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
          />
          Also notify customer (adds a system message stub)
        </label>
        {error ? (
          <div className="toast show error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        ) : null}
        <div className="action-btns">
          <button type="submit" className="btn btn-success btn-sm">
            Save status
          </button>
          <Link href={`/tech/messages/${item.id}`} className="btn btn-primary btn-sm">
            Open messages
          </Link>
          <Link href="/tech" className="btn btn-outline btn-sm">
            Queue
          </Link>
        </div>
        <div className={`toast${toast ? " show" : ""}`}>✅ Status updated</div>
      </form>

      <div className="portal-panel">
        <h2>Status history</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {item.timeline.map((t, i) => (
            <li
              key={`${t.at}-${i}`}
              style={{
                borderLeft: "2px solid var(--accent-cyan)",
                paddingLeft: 12,
              }}
            >
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--mono)" }}>
                {t.at}
              </div>
              <div style={{ fontSize: 14 }}>{t.text}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
