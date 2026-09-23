"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ADMIN_PROFILE,
  ADMIN_REQUESTS,
  ADMIN_SUBSCRIPTIONS,
  ADMIN_SUPPORT,
  ADMIN_USERS,
  REQUESTS_KEY,
  SUBS_KEY,
  SUPPORT_KEY,
  USERS_KEY,
  appendAudit,
  getUser,
  loadJson,
  saveJson,
  type AdminRequest,
  type AdminSubscription,
  type AdminSupportTicket,
  type AdminUser,
  type UserStatus,
} from "../../../lib/admin-data";
import {
  AdminPageHeader,
  AdminPanel,
  StatusBadge,
  Toast,
} from "../../../components/admin/ui";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sub, setSub] = useState<AdminSubscription | null>(null);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [toast, setToast] = useState("");

  const refresh = () => {
    const list = loadJson(USERS_KEY, ADMIN_USERS);
    const found = list.find((u) => u.id === params.id) ?? getUser(params.id) ?? null;
    setUser(found);
    if (!found) return;
    const subs = loadJson(SUBS_KEY, ADMIN_SUBSCRIPTIONS);
    setSub(subs.find((s) => s.userId === found.id) ?? null);
    setRequests(
      loadJson(REQUESTS_KEY, ADMIN_REQUESTS)
        .filter((r) => r.customerEmail === found.email)
        .slice(0, 5),
    );
    setTickets(
      loadJson(SUPPORT_KEY, ADMIN_SUPPORT)
        .filter((t) => t.customerEmail === found.email)
        .slice(0, 5),
    );
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const toggleStatus = () => {
    if (!user) return;
    const list = loadJson(USERS_KEY, ADMIN_USERS);
    const nextStatus: UserStatus = user.status === "Active" ? "Suspended" : "Active";
    const next = list.map((u) =>
      u.id === user.id ? { ...u, status: nextStatus } : u,
    );
    saveJson(USERS_KEY, next);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: nextStatus === "Suspended" ? "user.suspend" : "user.activate",
      target: user.id,
      detail: `${nextStatus} ${user.name}`,
    });
    setUser({ ...user, status: nextStatus });
    setToast(`User ${nextStatus.toLowerCase()}`);
    setTimeout(() => setToast(""), 2000);
  };

  if (!user) {
    return (
      <p style={{ color: "var(--text-muted)" }}>
        User not found. <Link href="/admin/users">Back</Link>
      </p>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={user.name}
        description={`${user.email} · ${user.role}`}
        actions={
          <button
            type="button"
            className={`btn btn-sm ${user.status === "Active" ? "btn-danger" : "btn-success"}`}
            onClick={toggleStatus}
          >
            {user.status === "Active" ? "Suspend" : "Activate"}
          </button>
        }
      />
      <AdminPanel title="Profile">
        <p style={{ fontSize: 14 }}>
          Status: <StatusBadge status={user.status} />
          <br />
          Role: <StatusBadge status={user.role} />
          <br />
          Company: <strong>{user.company ?? "—"}</strong>
          <br />
          Created: <strong>{user.createdAt}</strong>
        </p>
        {sub ? (
          <p style={{ marginTop: 12, fontSize: 14 }}>
            Subscription:{" "}
            <Link
              href={`/admin/subscriptions/${sub.id}`}
              style={{ color: "var(--accent-cyan)" }}
            >
              {sub.planName} ({sub.status})
            </Link>
          </p>
        ) : (
          <p style={{ marginTop: 12, fontSize: 14, color: "var(--text-muted)" }}>
            No subscription on file.
          </p>
        )}
        <div className="action-btns" style={{ marginTop: 16 }}>
          <Link href="/admin/users" className="btn btn-outline btn-sm">
            Back to users
          </Link>
        </div>
      </AdminPanel>
      <div className="portal-grid-2">
        <AdminPanel title="Recent requests">
          {requests.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>None</p>
          ) : (
            requests.map((r) => (
              <div key={r.id} style={{ marginBottom: 8, fontSize: 14 }}>
                <Link href={`/admin/requests/${r.id}`} style={{ color: "var(--accent-cyan)" }}>
                  {r.id}
                </Link>{" "}
                · {r.model} · <StatusBadge status={r.status} />
              </div>
            ))
          )}
        </AdminPanel>
        <AdminPanel title="Recent support">
          {tickets.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>None</p>
          ) : (
            tickets.map((t) => (
              <div key={t.id} style={{ marginBottom: 8, fontSize: 14 }}>
                <Link href={`/admin/support/${t.id}`} style={{ color: "var(--accent-cyan)" }}>
                  {t.id}
                </Link>{" "}
                · {t.subject} · <StatusBadge status={t.status} />
              </div>
            ))
          )}
        </AdminPanel>
      </div>
      <Toast message={toast} />
    </>
  );
}
