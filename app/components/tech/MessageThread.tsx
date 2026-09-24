"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  loadMessages,
  saveMessages,
  TECH_PROFILE,
  type TechAssignedRequest,
  type TechMessage,
} from "../../lib/tech-data";

const QUICK = [
  "Need clearer board photo",
  "Dump size looks short",
  "File ready in library",
] as const;

export function MessageThread({ item }: { item: TechAssignedRequest }) {
  const [messages, setMessages] = useState<TechMessage[]>([]);
  const [text, setText] = useState("");
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setMessages(loadMessages(item.id));
  }, [item.id]);

  const persist = (next: TechMessage[]) => {
    setMessages(next);
    saveMessages(item.id, next);
  };

  const send = (body: string) => {
    if (!body.trim()) return;
    const msg: TechMessage = {
      id: `TM-${Date.now()}`,
      requestId: item.id,
      from: "technician",
      text: body.trim(),
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    persist([...messages, msg]);
    setText("");
    setToast(true);
    setTimeout(() => setToast(false), 1600);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(text);
  };

  return (
    <div>
      <div className="portal-panel" style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 6 }}>
          {item.customerName} · {item.id}
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          {item.model} · {item.brand} · {item.customerEmail}
        </p>
        <div className="action-btns" style={{ marginTop: 12 }}>
          <Link href={`/tech/review/${item.id}`} className="btn btn-success btn-sm">
            Review
          </Link>
          <Link
            href={`/tech/requests/${item.id}/status`}
            className="btn btn-gold btn-sm"
          >
            Status
          </Link>
        </div>
      </div>

      <div className="portal-panel">
        <h2>Thread</h2>
        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          {messages.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No messages yet.</p>
          ) : (
            messages.map((m) => {
              const mine = m.from === "technician";
              const system = m.from === "system";
              return (
                <div
                  key={m.id}
                  style={{
                    maxWidth: "85%",
                    marginLeft: mine ? "auto" : 0,
                    marginRight: mine ? 0 : "auto",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    background: system
                      ? "var(--bg-surface-2)"
                      : mine
                        ? "var(--accent-cyan-soft)"
                        : "var(--bg-card)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--mono)",
                      color: "var(--text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    {system
                      ? "System"
                      : mine
                        ? TECH_PROFILE.name
                        : item.customerName}{" "}
                    · {m.at}
                  </div>
                  <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{m.text}</div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setText(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="msg">Message</label>
            <textarea
              id="msg"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write to the customer…"
            />
          </div>
          <button type="submit" className="btn btn-success btn-sm">
            Send
          </button>
          <div className={`toast${toast ? " show" : ""}`}>✅ Message sent (demo)</div>
        </form>
      </div>
    </div>
  );
}
