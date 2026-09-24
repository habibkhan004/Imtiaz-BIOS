"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  PortalPageHeader,
  StatusBadge,
} from "../../../components/portal/ui";
import {
  findPortalSupport,
  loadPortalSupport,
  savePortalSupportList,
  type SupportTicket,
} from "../../../lib/portal-data";

export default function SupportDetailPage() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<SupportTicket | null | undefined>(undefined);
  const [reply, setReply] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setRow(findPortalSupport(params.id) ?? null);
  }, [params.id]);

  const sendReply = (e: FormEvent) => {
    e.preventDefault();
    if (!row) return;
    if (!reply.trim()) {
      setError("Write a message before sending.");
      return;
    }
    setError("");
    const at = new Date().toISOString().slice(0, 16).replace("T", " ");
    const updated: SupportTicket = {
      ...row,
      status: row.status === "Resolved" ? "Waiting on customer" : row.status,
      updatedAt: at,
      messages: [
        ...row.messages,
        { at, from: "customer", text: reply.trim() },
      ],
    };
    const list = loadPortalSupport().map((t) =>
      t.id === updated.id ? updated : t,
    );
    if (!list.some((t) => t.id === updated.id)) list.unshift(updated);
    savePortalSupportList(list);
    setRow(updated);
    setReply("");
    setToast("✅ Reply sent");
    setTimeout(() => setToast(""), 2000);
  };

  if (row === undefined) {
    return (
      <p style={{ color: "var(--text-muted)" }}>Loading ticket…</p>
    );
  }

  if (!row) {
    return (
      <div className="portal-panel">
        <p>Ticket not found.</p>
        <Link href="/portal/support" className="btn btn-outline btn-sm">
          Back to support
        </Link>
      </div>
    );
  }

  return (
    <>
      <PortalPageHeader
        title={`${row.id} · ${row.subject}`}
        description={`${row.model} · ${row.priority}`}
        backFallback="/portal/support"
      />
      <div className="portal-panel">
        <p style={{ marginBottom: 12 }}>
          Status: <StatusBadge status={row.status} />
        </p>
        <h2>Description</h2>
        <p style={{ color: "var(--text-secondary)" }}>{row.description}</p>
        <h2 style={{ marginTop: 20 }}>Thread</h2>
        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {row.messages.map((m, i) => (
            <div
              key={`${m.at}-${i}`}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background:
                  m.from === "customer" ? "var(--bg-card)" : "var(--accent-cyan-soft)",
                maxWidth: "90%",
                marginLeft: m.from === "customer" ? "auto" : 0,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "var(--mono)",
                  color: "var(--text-muted)",
                  marginBottom: 4,
                }}
              >
                {m.from} · {m.at}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={sendReply} noValidate>
          <div className="field">
            <label htmlFor="reply">Your reply</label>
            <textarea
              id="reply"
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply to support…"
            />
          </div>
          {error ? (
            <div className="toast show error" style={{ marginBottom: 12 }}>
              {error}
            </div>
          ) : null}
          <div className="action-btns">
            <button type="submit" className="btn btn-success btn-sm">
              Send reply
            </button>
            <Link href="/portal/support" className="btn btn-outline btn-sm">
              All tickets
            </Link>
          </div>
        </form>
        {toast ? <div className="toast show">{toast}</div> : null}
      </div>
    </>
  );
}
