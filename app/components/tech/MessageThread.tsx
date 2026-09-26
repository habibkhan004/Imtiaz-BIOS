"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { TechPageHeader } from "./ui";

type Msg = {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
};

type TicketInfo = {
  id: string;
  ticketNumber: string;
  subject: string;
  model?: string;
  brand?: string;
  status: string;
};

const QUICK = [
  "Need clearer board photo",
  "Dump size looks short",
  "File ready in library",
] as const;

export function MessageThread() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/requests/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.ticket) {
        setError(data.error || "Ticket not found");
        setTicket(null);
        return;
      }
      setTicket({
        id: data.ticket.id,
        ticketNumber: data.ticket.ticketNumber,
        subject: data.ticket.subject,
        model: data.ticket.model || data.ticket.boardNumber,
        brand: data.ticket.brand,
        status: data.ticket.status,
      });
      setMessages(data.messages || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async (body: string) => {
    if (!body.trim() || !ticket) return;
    setPending(true);
    try {
      const res = await fetch(`/api/requests/${ticket.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Send failed");
        return;
      }
      setText("");
      setToast(true);
      setTimeout(() => setToast(false), 1600);
      await load();
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(text);
  };

  if (loading) {
    return <p style={{ color: "var(--text-muted)" }}>Loading thread…</p>;
  }

  if (!ticket) {
    return (
      <>
        <TechPageHeader title="Messages" description={error || "Not found"} />
        <Link href="/tech" className="btn btn-outline btn-sm">
          Back to queue
        </Link>
      </>
    );
  }

  return (
    <>
      <TechPageHeader
        title={`Messages · ${ticket.ticketNumber}`}
        description="Live ticket thread with the customer."
      />
      <div className="portal-panel" style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 6 }}>{ticket.subject}</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          {ticket.model || "—"} · {ticket.brand || "—"} · {ticket.status}
        </p>
        <div className="action-btns" style={{ marginTop: 12 }}>
          <Link href={`/tech/review/${ticket.id}`} className="btn btn-success btn-sm">
            Review
          </Link>
          <Link
            href={`/tech/requests/${ticket.id}/status`}
            className="btn btn-gold btn-sm"
          >
            Status
          </Link>
        </div>
      </div>

      <div className="portal-panel">
        <h2>Thread</h2>
        {error ? (
          <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>
        ) : null}
        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          {messages.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No messages yet.</p>
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
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 6,
                    fontFamily: "var(--mono)",
                  }}
                >
                  {new Date(m.createdAt).toLocaleString()}
                </div>
                <div style={{ fontSize: 14 }}>{m.message}</div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              className="btn btn-outline btn-sm"
              disabled={pending}
              onClick={() => send(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="msg">Reply</label>
            <textarea
              id="msg"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-success btn-sm" disabled={pending}>
            Send
          </button>
        </form>
        <div className={`toast${toast ? " show" : ""}`}>Sent</div>
      </div>
    </>
  );
}
