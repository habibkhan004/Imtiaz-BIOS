"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ADMIN_PLANS,
  ADMIN_PROFILE,
  PLANS_KEY,
  appendAudit,
  loadJson,
  saveJson,
  type AdminPlan,
} from "../../lib/admin-data";
import { AdminPageHeader, AdminPanel, StatusBadge, Toast } from "./ui";

export function PlansManager() {
  const [rows, setRows] = useState<AdminPlan[]>(ADMIN_PLANS);
  const [draft, setDraft] = useState<AdminPlan | null>(null);
  const [featuresText, setFeaturesText] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setRows(loadJson(PLANS_KEY, ADMIN_PLANS));
  }, []);

  const openEdit = (p: AdminPlan) => {
    setDraft(p);
    setFeaturesText(p.features.join("\n"));
  };

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const updated = {
      ...draft,
      features: featuresText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    };
    const next = rows.map((r) => (r.id === updated.id ? updated : r));
    setRows(next);
    saveJson(PLANS_KEY, next);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "plan.edit",
      target: updated.id,
      detail: `Updated ${updated.name}`,
    });
    setDraft(null);
    setToast("Plan saved");
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <>
      <AdminPageHeader
        title="Subscription Plans"
        description="Edit plan names, prices, limits, and feature bullets. No real billing."
      />
      <div className="portal-grid-2">
        {rows.map((p) => (
          <AdminPanel
            key={p.id}
            title={p.name}
            actions={
              <>
                {p.highlight ? <StatusBadge status="Active" /> : null}
                {!p.active ? <StatusBadge status="Cancelled" /> : null}
              </>
            }
          >
            <p style={{ margin: "0 0 10px", fontSize: 22, fontFamily: "var(--display)" }}>
              {p.price}
            </p>
            <p className="admin-cell-muted" style={{ marginBottom: 10 }}>
              Downloads {p.downloadsLimit} · Requests {p.requestsLimit}
            </p>
            <ul style={{ paddingLeft: 18, marginBottom: 14, fontSize: 14 }}>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button type="button" className="btn btn-success btn-sm" onClick={() => openEdit(p)}>
              Edit
            </button>
          </AdminPanel>
        ))}
      </div>
      {draft ? (
        <AdminPanel title={`Edit ${draft.name}`}>
          <form onSubmit={onSave}>
            <div className="portal-grid-2">
              <div className="field">
                <label>Name</label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Price</label>
                <input
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Download limit</label>
                <input
                  type="number"
                  value={draft.downloadsLimit}
                  onChange={(e) =>
                    setDraft({ ...draft, downloadsLimit: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="field">
                <label>Request limit</label>
                <input
                  type="number"
                  value={draft.requestsLimit}
                  onChange={(e) =>
                    setDraft({ ...draft, requestsLimit: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!draft.highlight}
                  onChange={(e) => setDraft({ ...draft, highlight: e.target.checked })}
                />
                Highlighted
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="field">
              <label>Features (one per line)</label>
              <textarea
                rows={5}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
              />
            </div>
            <div className="action-btns">
              <button type="submit" className="btn btn-success btn-sm">
                Save plan
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setDraft(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </AdminPanel>
      ) : null}
      <Toast message={toast} />
    </>
  );
}
