"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PortalPageHeader, StatCards, StatusBadge } from "./ui";

export function PortalDashboardClient() {
  const [trialDays, setTrialDays] = useState<number | null>(null);
  const [trialEnd, setTrialEnd] = useState("");
  const [subLabel, setSubLabel] = useState("No active subscription");
  const [downloads, setDownloads] = useState(0);
  const [openRequests, setOpenRequests] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [unread, setUnread] = useState(0);
  const [recentDl, setRecentDl] = useState<
    { id: string; fileName?: string; at: string }[]
  >([]);
  const [recentReq, setRecentReq] = useState<
    { id: string; requestNumber: string; boardModel: string; status: string }[]
  >([]);
  const [notes, setNotes] = useState<
    { id: string; title: string; body: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/users/profile", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setTrialDays(data.trialDaysRemaining);
        setTrialEnd(data.user?.trialEndDate || "");
        if (data.subscription) {
          setSubLabel(
            `${data.subscription.planName || "Plan"} · ends ${new Date(data.subscription.endsAt).toLocaleDateString()}`,
          );
        }
      });
    fetch("/api/downloads", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.items) return;
        setDownloads(data.items.length);
        setRecentDl(data.items.slice(0, 5));
      });
    fetch("/api/requests/my", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const reqs = data.requests || [];
        const ticks = data.tickets || [];
        setOpenRequests(
          reqs.filter((r: { status: string }) =>
            ["pending", "assigned", "in_progress", "needs_info"].includes(r.status),
          ).length,
        );
        setOpenTickets(
          ticks.filter((t: { status: string }) =>
            !["resolved", "closed"].includes(t.status),
          ).length,
        );
        setRecentReq(reqs.slice(0, 5));
      });
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setUnread(data.unread || 0);
        setNotes((data.items || []).slice(0, 3));
      });
  }, []);

  return (
    <>
      <PortalPageHeader
        eyebrow="DASHBOARD"
        title="Welcome back"
        description="Trial, subscription, downloads, requests, and alerts."
      />
      <StatCards
        items={[
          {
            label: "Trial days left",
            value: trialDays === null ? "…" : trialDays,
          },
          { label: "Downloads", value: downloads },
          { label: "Open file requests", value: openRequests },
          { label: "Open support tickets", value: openTickets },
        ]}
      />

      <div className="portal-panel">
        <h2>Access</h2>
        <p>
          Introductory access ends{" "}
          <strong>
            {trialEnd ? new Date(trialEnd).toLocaleDateString() : "—"}
          </strong>
          {trialDays !== null ? ` (${trialDays} days remaining)` : ""}.
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Subscription: {subLabel} ·{" "}
          <Link href="/portal/subscription" style={{ color: "var(--accent-cyan)" }}>
            Manage plan
          </Link>
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Unread notifications: {unread}
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
          {recentDl.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No downloads yet.</p>
          ) : (
            <div className="lib-table">
              {recentDl.map((d) => (
                <div
                  className="lib-row"
                  key={d.id}
                  style={{ gridTemplateColumns: "1.2fr 1fr" }}
                >
                  <span className="lib-model">{d.fileName || d.id}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {new Date(d.at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/portal/downloads"
            className="btn btn-success btn-sm"
            style={{ marginTop: 12 }}
          >
            All downloads
          </Link>
        </div>
        <div className="portal-panel">
          <h2>Recent file requests</h2>
          {recentReq.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No requests yet.</p>
          ) : (
            <div className="lib-table">
              {recentReq.map((r) => (
                <div
                  className="lib-row"
                  key={r.id}
                  style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
                >
                  <span className="lib-model">{r.requestNumber}</span>
                  <span>{r.boardModel}</span>
                  <span>
                    <StatusBadge status={r.status} />
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/portal/requests"
            className="btn btn-success btn-sm"
            style={{ marginTop: 12 }}
          >
            All requests
          </Link>
        </div>
      </div>

      <div className="portal-panel">
        <h2>Latest notifications</h2>
        {notes.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Inbox empty.</p>
        ) : (
          notes.map((n) => (
            <div key={n.id} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{n.body}</div>
            </div>
          ))
        )}
        <Link href="/portal/notifications" className="btn btn-outline btn-sm">
          Open inbox
        </Link>
      </div>
    </>
  );
}
