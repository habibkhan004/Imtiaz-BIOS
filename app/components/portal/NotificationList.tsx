"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Note = {
  id: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

export function NotificationList() {
  const [items, setItems] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setItems(data.items || []);
        setUnread(data.unread || 0);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const mark = async (id?: string, markAll?: boolean) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(markAll ? { markAll: true } : { id }),
    });
    load();
  };

  return (
    <div className="portal-panel">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          {unread} unread
        </p>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => mark(undefined, true)}
        >
          Mark all read
        </button>
      </div>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No notifications yet.</p>
      ) : (
        items.map((n) => (
          <div
            key={n.id}
            style={{
              marginBottom: 14,
              paddingBottom: 14,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              opacity: n.read ? 0.7 : 1,
            }}
          >
            <div style={{ fontWeight: 600 }}>{n.title}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{n.body}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              {new Date(n.createdAt).toLocaleString()}
            </div>
            <div className="action-btns" style={{ marginTop: 8 }}>
              {!n.read ? (
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => mark(n.id)}
                >
                  Mark read
                </button>
              ) : null}
              {n.href ? (
                <Link href={n.href} className="btn btn-outline btn-sm">
                  Open
                </Link>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
