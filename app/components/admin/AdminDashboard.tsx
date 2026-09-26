"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readAuth } from "../../lib/auth";
import { AdminPanel, StatusBadge } from "./ui";

type DashStats = {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  totalFiles: number;
  verifiedFiles: number;
  pendingUploads: number;
  freeFiles: number;
  paidFiles: number;
  downloadsToday: number;
  openRequests: number;
  openTickets: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  paymentCount: number;
  failedPayments: number;
  revenue: number;
};

export function AdminDashboard() {
  const [name] = useState(() => readAuth()?.name ?? "Admin");
  const [stats, setStats] = useState<DashStats | null>(null);
  const [recentUploads, setRecentUploads] = useState<
    { id: string; originalName: string; status: string; boardNumber: string }[]
  >([]);
  const [recentAudit, setRecentAudit] = useState<
    { id: string; summary: string; createdAt: string; action: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/admin/dashboard", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.stats) return;
        setStats(data.stats);
        setRecentUploads(data.recentUploads || []);
        setRecentAudit(data.recentAudit || []);
      })
      .catch(() => undefined);
  }, []);

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "Users", value: stats.totalUsers },
      { label: "Active users", value: stats.activeUsers },
      { label: "New (7d)", value: stats.newRegistrations },
      { label: "Library files", value: stats.totalFiles },
      { label: "Verified", value: stats.verifiedFiles },
      { label: "Uploads pending", value: stats.pendingUploads },
      { label: "Free / paid", value: `${stats.freeFiles}/${stats.paidFiles}` },
      { label: "Downloads today", value: stats.downloadsToday },
      { label: "Open requests", value: stats.openRequests },
      { label: "Open tickets", value: stats.openTickets },
      { label: "Active subs", value: stats.activeSubscriptions },
      { label: "Revenue (demo)", value: `$${stats.revenue}` },
    ];
  }, [stats]);

  return (
    <>
      <div className="admin-hero">
        <h1>
          Welcome, <span className="accent-cyan">{name.split(" ")[0]}</span>.{" "}
          <span className="accent-gold">Run the lab.</span>
        </h1>
        <p className="lead">
          Live aggregates from the platform store — uploads, requests, billing, and library.
        </p>
        <div className="hero-actions">
          <Link href="/admin/uploads" className="btn btn-primary">
            ⬆ Review uploads
          </Link>
          <Link href="/admin/users" className="btn btn-purple">
            👤 Manage users
          </Link>
          <Link href="/admin/requests" className="btn btn-gold">
            📋 Requests
          </Link>
        </div>
        <div className="stat-row admin-stat-row">
          {cards.length === 0 ? (
            <div className="stat">
              <b>…</b>
              <span>Loading</span>
            </div>
          ) : (
            cards.slice(0, 5).map((c) => (
              <div className="stat" key={c.label}>
                <b>{c.value}</b>
                <span>{c.label}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-grid-2" style={{ marginTop: 24 }}>
        <AdminPanel title="More metrics">
          <div className="lib-table">
            {cards.slice(5).map((c) => (
              <div
                className="lib-row"
                key={c.label}
                style={{ gridTemplateColumns: "1fr auto" }}
              >
                <span>{c.label}</span>
                <strong>{c.value}</strong>
              </div>
            ))}
          </div>
        </AdminPanel>
        <AdminPanel title="Recent uploads">
          {recentUploads.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No uploads yet.</p>
          ) : (
            recentUploads.map((u) => (
              <div key={u.id} style={{ marginBottom: 10 }}>
                <Link href="/admin/uploads" style={{ color: "var(--accent-cyan)" }}>
                  {u.originalName}
                </Link>{" "}
                · {u.boardNumber} <StatusBadge status={u.status} />
              </div>
            ))
          )}
        </AdminPanel>
      </div>

      <AdminPanel title="Audit feed">
        {recentAudit.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No admin actions recorded yet.</p>
        ) : (
          recentAudit.map((a) => (
            <div key={a.id} style={{ marginBottom: 10, fontSize: 14 }}>
              <strong>{a.action}</strong> — {a.summary}
              <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
        <Link href="/admin/audit" className="btn btn-outline btn-sm" style={{ marginTop: 8 }}>
          Full audit log
        </Link>
      </AdminPanel>
    </>
  );
}
