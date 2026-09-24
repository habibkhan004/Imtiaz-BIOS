"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ADMIN_PROFILE,
  ADMIN_SERVICES,
  SERVICES_KEY,
  appendAudit,
  loadJson,
  saveJson,
  type AdminService,
} from "../../lib/admin-data";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

export function ServicesManager() {
  const [rows, setRows] = useState<AdminService[]>(ADMIN_SERVICES);
  const [draft, setDraft] = useState<AdminService | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setRows(loadJson(SERVICES_KEY, ADMIN_SERVICES));
  }, []);

  const persist = (next: AdminService[]) => {
    setRows(next);
    saveJson(SERVICES_KEY, next);
  };

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    if (!draft?.title.trim()) return;
    const next = rows.map((r) => (r.id === draft.id ? draft : r));
    if (!rows.some((r) => r.id === draft.id)) next.push(draft);
    next.sort((a, b) => a.sortOrder - b.sortOrder);
    persist(next);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "service.edit",
      target: draft.id,
      detail: `Saved ${draft.title}`,
    });
    setDraft(null);
    setToast("Service saved (demo — public page uses static seed)");
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <>
      <AdminPageHeader
        title="Services"
        description="Manage public services offerings. Demo saves to localStorage."
      />
      <AdminPanel title={`Services (${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState title="No services" body="Nothing configured yet." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-services">
              <span></span>
              <span>Title</span>
              <span>Description</span>
              <span>Price</span>
              <span>Order</span>
              <span>Actions</span>
            </div>
            {rows.map((s) => (
              <div className="lib-row admin-row-services" key={s.id}>
                <span>{s.icon}</span>
                <span className="lib-model">
                  {s.title}{" "}
                  {!s.active ? <StatusBadge status="Suspended" /> : null}
                </span>
                <span className="admin-cell-muted">{s.desc}</span>
                <span>{s.price}</span>
                <span>{s.sortOrder}</span>
                <div className="action-btns">
                  <button type="button" className="btn btn-success btn-sm" onClick={() => setDraft(s)}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </AdminTable>
        )}
      </AdminPanel>
      {draft ? (
        <AdminPanel title="Edit service">
          <form onSubmit={onSave}>
            <div className="portal-grid-2">
              <div className="field">
                <label>Icon</label>
                <input
                  value={draft.icon}
                  onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Title</label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
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
                <label>Sort order</label>
                <input
                  type="number"
                  value={draft.sortOrder}
                  onChange={(e) =>
                    setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })
                  }
                />
              </div>
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
              <label>Description</label>
              <textarea
                rows={3}
                value={draft.desc}
                onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
              />
            </div>
            <div className="action-btns">
              <button type="submit" className="btn btn-success btn-sm">
                Save
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
