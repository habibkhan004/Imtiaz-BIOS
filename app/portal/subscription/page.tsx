"use client";

import { useEffect, useState } from "react";
import {
  PLANS,
  loadPortalSubscription,
  savePortalSubscription,
  type Subscription,
} from "../../lib/portal-data";
import { PortalPageHeader, StatusBadge } from "../../components/portal/ui";

export default function SubscriptionPage() {
  const [toast, setToast] = useState("");
  const [sub, setSub] = useState<Subscription | null>(null);

  useEffect(() => {
    setSub(loadPortalSubscription());
  }, []);

  if (!sub) {
    return <p style={{ color: "var(--text-muted)" }}>Loading subscription…</p>;
  }

  const dlPct = Math.min(
    100,
    Math.round((sub.downloadsUsed / Math.max(sub.downloadsLimit, 1)) * 100),
  );
  const rqPct = Math.min(
    100,
    Math.round((sub.requestsUsed / Math.max(sub.requestsLimit, 1)) * 100),
  );

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const applyPlan = (planId: string) => {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return;
    if (plan.id === sub.planId) {
      flash("This is your current plan.");
      return;
    }
    const limits =
      plan.id === "shop"
        ? { downloadsLimit: 9999, requestsLimit: 9999 }
        : plan.id === "pro"
          ? { downloadsLimit: 50, requestsLimit: 10 }
          : { downloadsLimit: 3, requestsLimit: 1 };
    const next: Subscription = {
      ...sub,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      status: "Active",
      renewDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      ...limits,
    };
    savePortalSubscription(next);
    setSub(next);
    flash(`✅ Switched to ${plan.name} (demo)`);
  };

  const renew = () => {
    const next: Subscription = {
      ...sub,
      status: "Active",
      renewDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    };
    savePortalSubscription(next);
    setSub(next);
    flash("✅ Renewed +30 days (demo)");
  };

  const cancel = () => {
    const next: Subscription = { ...sub, status: "Expiring" };
    savePortalSubscription(next);
    setSub(next);
    flash("⚠️ Cancellation scheduled — plan expires on renew date (demo)");
  };

  return (
    <>
      <PortalPageHeader
        title="Your plan"
        description="Manage limits, renewals, and upgrades. Billing is mocked in this demo."
      />

      <div className="portal-panel">
        <h2>
          Current · {sub.planName} <StatusBadge status={sub.status} />
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          {sub.price} · renews {sub.renewDate}
        </p>
        <div className="portal-meter">
          <div style={{ fontSize: 13, marginBottom: 4 }}>
            Downloads {sub.downloadsUsed}/{sub.downloadsLimit}
          </div>
          <div className="portal-meter-track">
            <div className="portal-meter-fill" style={{ width: `${dlPct}%` }} />
          </div>
        </div>
        <div className="portal-meter">
          <div style={{ fontSize: 13, marginBottom: 4 }}>
            File requests {sub.requestsUsed}/{sub.requestsLimit}
          </div>
          <div className="portal-meter-track">
            <div className="portal-meter-fill" style={{ width: `${rqPct}%` }} />
          </div>
        </div>
        <div className="action-btns" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={renew}>
            Renew +30 days
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={cancel}>
            Cancel plan
          </button>
        </div>
      </div>

      <div className="services-grid">
        {PLANS.map((plan) => (
          <div
            className="service-card"
            key={plan.id}
            style={
              plan.highlight ? { borderColor: "var(--accent-cyan)" } : undefined
            }
          >
            <h3>{plan.name}</h3>
            <p style={{ color: "var(--accent-cyan)", fontFamily: "var(--mono)" }}>
              {plan.price}
            </p>
            <ul
              style={{
                textAlign: "left",
                color: "var(--text-secondary)",
                fontSize: 13,
                margin: "12px 0",
                paddingLeft: 18,
              }}
            >
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              type="button"
              className={`btn btn-sm ${plan.id === sub.planId ? "btn-outline" : "btn-primary"}`}
              onClick={() => applyPlan(plan.id)}
            >
              {plan.id === sub.planId ? "Current plan" : "Upgrade"}
            </button>
          </div>
        ))}
      </div>
      {toast ? <div className="toast show">{toast}</div> : null}
    </>
  );
}
