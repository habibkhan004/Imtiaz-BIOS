import Link from "next/link";
import {
  CURRENT_SUBSCRIPTION,
  DOWNLOADS,
  FILE_REQUESTS,
  getDashboardStats,
  NOTIFICATIONS,
} from "../lib/portal-data";
import { PortalPageHeader, StatCards, StatusBadge } from "../components/portal/ui";

export const metadata = { title: "Dashboard" };

export default function PortalDashboardPage() {
  const stats = getDashboardStats();

  return (
    <>
      <PortalPageHeader
        eyebrow="DASHBOARD"
        title="Welcome back"
        description="Your downloads, requests, subscription, and alerts at a glance."
      />
      <StatCards
        items={[
          { label: "Downloads this month", value: stats.downloadsThisMonth },
          { label: "Open file requests", value: stats.openFileRequests },
          { label: "Open support tickets", value: stats.openSupportTickets },
          { label: "Unread notifications", value: stats.unreadNotifications },
        ]}
      />

      <div className="portal-panel">
        <h2>Subscription</h2>
        <p>
          <strong>{CURRENT_SUBSCRIPTION.planName}</strong> · {CURRENT_SUBSCRIPTION.price}{" "}
          <StatusBadge status={CURRENT_SUBSCRIPTION.status} />
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Renews {CURRENT_SUBSCRIPTION.renewDate} ·{" "}
          <Link href="/portal/subscription" style={{ color: "var(--accent-cyan)" }}>
            Manage plan
          </Link>
        </p>
      </div>

      <div className="action-btns" style={{ marginBottom: 20 }}>
        <Link href="/portal/requests" className="btn btn-primary btn-sm">
          Request a file
        </Link>
        <Link href="/portal/uploads" className="btn btn-purple btn-sm">
          Upload dump
        </Link>
        <Link href="/library" className="btn btn-outline btn-sm">
          Browse library
        </Link>
      </div>

      <div className="portal-grid-2">
        <div className="portal-panel">
          <h2>Recent downloads</h2>
          <div className="lib-table">
            {DOWNLOADS.slice(0, 5).map((d) => (
              <div className="lib-row" key={d.id} style={{ gridTemplateColumns: "1.2fr 1fr 1fr" }}>
                <span className="lib-model">{d.model}</span>
                <span>{d.type}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{d.downloadedAt}</span>
              </div>
            ))}
          </div>
          <Link href="/portal/downloads" className="btn btn-success btn-sm" style={{ marginTop: 12 }}>
            All downloads
          </Link>
        </div>
        <div className="portal-panel">
          <h2>Recent file requests</h2>
          <div className="lib-table">
            {FILE_REQUESTS.slice(0, 5).map((r) => (
              <div className="lib-row" key={r.id} style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <span className="lib-model">{r.id}</span>
                <span>{r.model}</span>
                <span>
                  <StatusBadge status={r.status} />
                </span>
              </div>
            ))}
          </div>
          <Link href="/portal/requests" className="btn btn-success btn-sm" style={{ marginTop: 12 }}>
            All requests
          </Link>
        </div>
      </div>

      <div className="portal-panel">
        <h2>Latest notifications</h2>
        {NOTIFICATIONS.slice(0, 3).map((n) => (
          <div key={n.id} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>{n.title}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{n.body}</div>
          </div>
        ))}
        <Link href="/portal/notifications" className="btn btn-success btn-sm">
          View all
        </Link>
      </div>
    </>
  );
}
