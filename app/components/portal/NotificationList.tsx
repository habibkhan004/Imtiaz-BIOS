"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NOTIFICATIONS, type NotificationItem } from "../../lib/portal-data";

const READ_KEY = "imtiaz-notif-read";

export function NotificationList() {
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      if (raw) setReadIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (ids: string[]) => {
    setReadIds(ids);
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  };

  const visible = useMemo(() => {
    return items.filter((n) => {
      const isRead = n.read || readIds.includes(n.id);
      if (filter === "unread") return !isRead;
      return true;
    });
  }, [items, filter, readIds]);

  const markRead = (id: string) => {
    if (!readIds.includes(id)) persist([...readIds, id]);
  };

  const markAll = () => {
    persist(Array.from(new Set([...readIds, ...items.map((n) => n.id)])));
  };

  return (
    <div className="portal-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Inbox</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filter === "unread" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter("unread")}
          >
            Unread
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={markAll}>
            Mark all read
          </button>
        </div>
      </div>
      {visible.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No notifications.</p>
      ) : (
        visible.map((n) => {
          const isRead = n.read || readIds.includes(n.id);
          return (
            <Link
              key={n.id}
              href={n.href}
              className={`notif-item${!isRead ? " unread" : ""}`}
              onClick={() => markRead(n.id)}
            >
              <div style={{ fontSize: 22 }}>
                {n.type === "request"
                  ? "📁"
                  : n.type === "support"
                    ? "🛠️"
                    : n.type === "upload"
                      ? "📤"
                      : n.type === "billing"
                        ? "💳"
                        : "🔔"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{n.title}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{n.body}</div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--mono)",
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  {n.time}
                </div>
              </div>
              {!isRead ? (
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    markRead(n.id);
                  }}
                >
                  Read
                </button>
              ) : null}
            </Link>
          );
        })
      )}
    </div>
  );
}
