"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ADMIN_PLANS,
  ADMIN_PROFILE,
  ADMIN_SUBSCRIPTIONS,
  PLANS_KEY,
  SUBS_KEY,
  appendAudit,
  loadJson,
  saveJson,
  type AdminPlan,
  type AdminSubscription,
  type SubStatus,
} from "../../lib/admin-data";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

export function SubscriptionsManager({ detailId }: { detailId?: string }) {
  const [rows, setRows] = useState<AdminSubscription[]>(ADMIN_SUBSCRIPTIONS);
  const [plans, setPlans] = useState<AdminPlan[]>(ADMIN_PLANS);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setRows(loadJson(SUBS_KEY, ADMIN_SUBSCRIPTIONS));
    setPlans(loadJson(PLANS_KEY, ADMIN_PLANS));
  }, []);

  const persist = (next: AdminSubscription[]) => {
    setRows(next);
    saveJson(SUBS_KEY, next);
  };

  const detail = detailId ? rows.find((s) => s.id === detailId) : null;

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };

  const patch = (id: string, updates: Partial<AdminSubscription>, detailText: string) => {
    persist(rows.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "subscription.change",
      target: id,
      detail: detailText,
    });
    flash("Subscription updated");
  };

  if (detailId && !detail) {
    return (
      <EmptyState
        title="Subscription not found"
        body="Unknown id."
        actionHref="/admin/subscriptions"
        actionLabel="Back"
      />
    );
  }

  if (detail) {
    const pctD = Math.min(
      100,
      Math.round((detail.downloadsUsed / Math.max(detail.downloadsLimit, 1)) * 100),
    );
    const pctR = Math.min(
      100,
      Math.round((detail.requestsUsed / Math.max(detail.requestsLimit, 1)) * 100),
    );
    return (
      <>
        <AdminPageHeader
          title={detail.customerName}
          description={`${detail.customerEmail} · ${detail.planName}`}
        />
        <AdminPanel title="Subscription">
          <p style={{ marginBottom: 14 }}>
            Status: <StatusBadge status={detail.status} /> · Renews {detail.renewDate}
          </p>
          <div className="portal-meter" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              Downloads {detail.downloadsUsed}/{detail.downloadsLimit}
            </div>
            <div className="portal-meter-track">
              <div className="portal-meter-fill" style={{ width: `${pctD}%` }} />
            </div>
          </div>
          <div className="portal-meter" style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              Requests {detail.requestsUsed}/{detail.requestsLimit}
            </div>
            <div className="portal-meter-track">
              <div className="portal-meter-fill" style={{ width: `${pctR}%` }} />
            </div>
          </div>
          <div className="field">
            <label>Plan</label>
            <select
              value={detail.planId}
              onChange={(e) => {
                const plan = plans.find((p) => p.id === e.target.value);
                if (!plan) return;
                patch(
                  detail.id,
                  {
                    planId: plan.id,
                    planName: plan.name,
                    downloadsLimit: plan.downloadsLimit,
                    requestsLimit: plan.requestsLimit,
                    status: "Active",
                  },
                  `Changed plan to ${plan.name}`,
                );
              }}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select
              value={detail.status}
              onChange={(e) =>
                patch(detail.id, { status: e.target.value as SubStatus }, `Status ${e.target.value}`)
              }
            >
              {(["Active", "Expiring", "Cancelled", "None"] as SubStatus[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Renew date</label>
            <input
              value={detail.renewDate}
              onChange={(e) => patch(detail.id, { renewDate: e.target.value }, "Extended renew date")}
            />
          </div>
          <div className="action-btns" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() =>
                patch(
                  detail.id,
                  {
                    renewDate: new Date(Date.now() + 30 * 86400000)
                      .toISOString()
                      .slice(0, 10),
                    status: "Active",
                  },
                  "Extended +30 days",
                )
              }
            >
              Extend +30 days
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => patch(detail.id, { status: "Cancelled" }, "Cancelled")}
            >
              Cancel
            </button>
            <Link href="/admin/subscriptions" className="btn btn-outline btn-sm">
              Back
            </Link>
          </div>
        </AdminPanel>
        <Toast message={toast} />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Subscriptions"
        description="Customer subscription records, usage, and plan changes."
      />
      <AdminPanel title={`Subscriptions (${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState title="No subscriptions" body="No customer subscriptions yet." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-subs">
              <span>Customer</span>
              <span>Plan</span>
              <span>Status</span>
              <span>Renew</span>
              <span>Usage</span>
              <span></span>
            </div>
            {rows.map((s) => (
              <div className="lib-row admin-row-subs" key={s.id}>
                <span className="lib-model">{s.customerName}</span>
                <span>{s.planName}</span>
                <span>
                  <StatusBadge status={s.status} />
                </span>
                <span className="admin-cell-date">{s.renewDate}</span>
                <span className="admin-cell-muted">
                  DL {s.downloadsUsed}/{s.downloadsLimit} · RQ {s.requestsUsed}/
                  {s.requestsLimit}
                </span>
                <div className="action-btns">
                  <Link
                    href={`/admin/subscriptions/${s.id}`}
                    className="btn btn-success btn-sm"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </AdminTable>
        )}
      </AdminPanel>
      <Toast message={toast} />
    </>
  );
}
