"use client";

import { useEffect, useState } from "react";
import { PortalPageHeader, StatusBadge } from "../../components/portal/ui";

type Plan = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  features: string[];
  active: boolean;
};

type Sub = {
  id: string;
  planId: string;
  status: string;
  startsAt: string;
  endsAt: string;
  plan?: Plan;
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<Sub | null>(null);
  const [toast, setToast] = useState("");
  const [pending, setPending] = useState(false);

  const load = () => {
    fetch("/api/plans", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setPlans(data.plans || []);
        setSub(data.subscription || null);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const subscribe = async (planId: string) => {
    setPending(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Unable to subscribe.");
        return;
      }
      flash("✅ Subscription updated (demo payment recorded).");
      load();
    } catch {
      flash("Network error.");
    } finally {
      setPending(false);
    }
  };

  const cancel = async () => {
    setPending(true);
    try {
      await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "cancel" }),
      });
      flash("Subscription cancelled.");
      load();
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <PortalPageHeader
        eyebrow="SUBSCRIPTION"
        title="Plans & access"
        description="Introductory trial covers paid files while active. Upgrade anytime."
      />
      <div className="portal-panel">
        <h2>Current plan</h2>
        {sub ? (
          <p>
            <strong>{sub.plan?.name || "Plan"}</strong> · ${sub.plan?.price ?? "—"}{" "}
            <StatusBadge status={sub.status} />
            <br />
            <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {new Date(sub.startsAt).toLocaleDateString()} →{" "}
              {new Date(sub.endsAt).toLocaleDateString()}
            </span>
          </p>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>No active paid subscription.</p>
        )}
        {sub ? (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={cancel}
            disabled={pending}
          >
            Cancel
          </button>
        ) : null}
        {toast ? <div className="toast show">{toast}</div> : null}
      </div>

      <div className="portal-grid-2">
        {plans.map((p) => (
          <div className="portal-panel" key={p.id}>
            <h2>
              {p.name} · ${p.price}
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {p.durationDays} days
            </p>
            <ul style={{ margin: "12px 0", paddingLeft: 18, color: "var(--text-secondary)" }}>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={pending || (sub?.planId === p.id && sub.status === "active")}
              onClick={() => subscribe(p.id)}
            >
              {sub?.planId === p.id ? "Current / renew" : "Subscribe (demo)"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
