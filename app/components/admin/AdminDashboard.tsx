"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ADMIN_AUDIT_SEED,
  ADMIN_PROFILE,
  ADMIN_REQUESTS,
  ADMIN_SUPPORT,
  ADMIN_UPLOADS,
  getAuditEvents,
  getDashboardStats,
} from "../../lib/admin-data";
import { readAuth } from "../../lib/auth";
import { AdminPanel, StatusBadge } from "./ui";

export function AdminDashboard() {
  const stats = getDashboardStats();
  const [name] = useState(() => readAuth()?.name ?? ADMIN_PROFILE.name);
  const audits = useMemo(() => {
    try {
      return getAuditEvents().slice(0, 5);
    } catch {
      return ADMIN_AUDIT_SEED.slice(0, 5);
    }
  }, []);

  const pendingUploads = ADMIN_UPLOADS.filter(
    (u) => u.status === "Queued" || u.status === "Needs changes",
  ).slice(0, 5);
  const openRequests = ADMIN_REQUESTS.filter(
    (r) => r.status === "Pending" || r.status === "In review",
  ).slice(0, 5);
  const openSupport = ADMIN_SUPPORT.filter((t) => t.status !== "Resolved").slice(
    0,
    5,
  );

  return (
    <>
      <div className="admin-hero">
        <h1>
          Welcome, <span className="accent-cyan">{name.split(" ")[0]}</span>.{" "}
          <span className="accent-gold">Run the lab.</span>
        </h1>
        <p className="lead">
          Users, library, requests, and billing — dark cyan console matched to the
          public dashboard.
        </p>
        <div className="hero-actions">
          <Link href="/admin/uploads" className="btn btn-primary">
            ⬆ Review uploads
          </Link>
          <Link href="/admin/users" className="btn btn-purple">
            👤 Manage users
          </Link>
          <Link href="/admin/reports" className="btn btn-gold">
            📊 Reports
          </Link>
        </div>
        <div className="stat-row admin-stat-row">
          <div className="stat">
            <b>{stats.totalUsers}</b>
            <span>Users</span>
          </div>
          <div className="stat">
            <b>{stats.activeSubscriptions}</b>
            <span>Active subs</span>
          </div>
          <div className="stat">
            <b>{stats.uploadsPending}</b>
            <span>Uploads pending</span>
          </div>
          <div className="stat">
            <b>{stats.libraryFiles}</b>
            <span>Library files</span>
          </div>
          <div className="stat">
            <b>{stats.openFileRequests}</b>
            <span>Open requests</span>
          </div>
          <div className="stat">
            <b>{stats.paidRevenueMtd}</b>
            <span>Paid MTD</span>
          </div>
          <div className="stat">
            <b>{stats.openSupportTickets}</b>
            <span>Support open</span>
          </div>
          <div className="stat">
            <b>{stats.failedPayments}</b>
            <span>Failed payments</span>
          </div>
        </div>
      </div>

      <div className="portal-grid-2">
        <QueuePanel
          title="Pending uploads"
          href="/admin/uploads"
          rows={pendingUploads.map((u) => ({
            id: u.id,
            label: `${u.filename} · ${u.model}`,
            status: u.status,
            href: `/admin/uploads/${u.id}`,
          }))}
        />
        <QueuePanel
          title="Open requests"
          href="/admin/requests"
          rows={openRequests.map((r) => ({
            id: r.id,
            label: `${r.id} · ${r.model}`,
            status: r.status,
            href: `/admin/requests/${r.id}`,
          }))}
        />
        <QueuePanel
          title="Open support"
          href="/admin/support"
          rows={openSupport.map((t) => ({
            id: t.id,
            label: `${t.id} · ${t.subject}`,
            status: t.status,
            href: `/admin/support/${t.id}`,
          }))}
        />
        <AdminPanel
          title="Recent audit"
          actions={
            <Link href="/admin/audit" className="btn btn-success btn-sm">
              View all
            </Link>
          }
        >
          <ul className="admin-audit-list">
            {audits.map((a) => (
              <li key={a.id}>
                <div className="admin-audit-meta">
                  {a.at} · {a.actor}
                </div>
                <div>
                  <strong>{a.action}</strong> → {a.target}
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>
    </>
  );
}

function QueuePanel({
  title,
  href,
  rows,
}: {
  title: string;
  href: string;
  rows: { id: string; label: string; status: string; href: string }[];
}) {
  return (
    <AdminPanel
      title={title}
      actions={
        <Link href={href} className="btn btn-success btn-sm">
          View all
        </Link>
      }
    >
      {rows.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Queue clear.</p>
      ) : (
        <div className="admin-queue-list">
          {rows.map((r) => (
            <Link key={r.id} href={r.href} className="admin-queue-item">
              <span>{r.label}</span>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
