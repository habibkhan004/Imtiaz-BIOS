"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

type Row = {
  id: string;
  name: string;
  roleOrCompany: string;
  quote: string;
  rating: number;
  active: boolean;
  sortOrder: number;
};

const emptyDraft = (): Omit<Row, "id"> => ({
  name: "",
  roleOrCompany: "",
  quote: "",
  rating: 5,
  active: true,
  sortOrder: 0,
});

export function TestimonialsManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<(Partial<Row> & Omit<Row, "id">) | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setRows(data.testimonials || []);
      else flash(data.error || "Failed to load");
    } catch {
      flash("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setDraft({
      ...emptyDraft(),
      sortOrder: rows.reduce((m, r) => Math.max(m, r.sortOrder), 0) + 1,
    });
  };

  const openEdit = (row: Row) => {
    setEditingId(row.id);
    setDraft({ ...row });
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft?.name?.trim() || !draft.quote?.trim()) {
      flash("Name and quote are required");
      return;
    }
    const payload = {
      id: editingId || undefined,
      name: draft.name.trim(),
      roleOrCompany: (draft.roleOrCompany || "").trim(),
      quote: draft.quote.trim(),
      rating: Number(draft.rating) || 5,
      active: draft.active !== false,
      sortOrder: Number(draft.sortOrder) || 0,
    };
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Save failed");
        return;
      }
      flash(editingId ? "Feedback updated" : "Feedback added");
      setDraft(null);
      setEditingId(null);
      await load();
    } catch {
      flash("Network error");
    }
  };

  const toggleActive = async (row: Row) => {
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, active: !row.active }),
      });
      if (!res.ok) {
        const data = await res.json();
        flash(data.error || "Update failed");
        return;
      }
      await load();
    } catch {
      flash("Network error");
    }
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete feedback from ${row.name}?`)) return;
    try {
      const res = await fetch(
        `/api/admin/testimonials?id=${encodeURIComponent(row.id)}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const data = await res.json();
        flash(data.error || "Delete failed");
        return;
      }
      flash("Deleted");
      await load();
    } catch {
      flash("Network error");
    }
  };

  const stars = (n: number) => "★".repeat(Math.min(5, Math.max(1, n)));

  return (
    <>
      <AdminPageHeader
        title="Client feedback"
        description="Manage testimonials shown on the home page and /testimonials."
      />
      <AdminPanel
        title={`Feedback (${rows.length})`}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
            Add feedback
          </button>
        }
      >
        {loading ? (
          <p className="admin-cell-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No feedback yet"
            body="Add client testimonials to show on the public site."
          />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-feedback">
              <span>Client</span>
              <span>Quote</span>
              <span>Rating</span>
              <span>Order</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {rows.map((r) => (
              <div className="lib-row admin-row-feedback" key={r.id}>
                <span className="lib-model">
                  {r.name}
                  <br />
                  <span className="admin-cell-muted">{r.roleOrCompany}</span>
                </span>
                <span className="admin-cell-muted">{r.quote.slice(0, 120)}
                  {r.quote.length > 120 ? "…" : ""}
                </span>
                <span>{stars(r.rating)}</span>
                <span>{r.sortOrder}</span>
                <span>
                  {r.active ? (
                    <StatusBadge status="Active" />
                  ) : (
                    <StatusBadge status="Suspended" />
                  )}
                </span>
                <div className="action-btns">
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => openEdit(r)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => void toggleActive(r)}
                  >
                    {r.active ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => void remove(r)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </AdminTable>
        )}
      </AdminPanel>

      {draft ? (
        <AdminPanel title={editingId ? "Edit feedback" : "Add feedback"}>
          <form onSubmit={onSave}>
            <div className="portal-grid-2">
              <div className="field">
                <label htmlFor="fbName">Name</label>
                <input
                  id="fbName"
                  value={draft.name || ""}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="fbRole">Role / company</label>
                <input
                  id="fbRole"
                  value={draft.roleOrCompany || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, roleOrCompany: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="fbRating">Rating (1–5)</label>
                <input
                  id="fbRating"
                  type="number"
                  min={1}
                  max={5}
                  value={draft.rating ?? 5}
                  onChange={(e) =>
                    setDraft({ ...draft, rating: Number(e.target.value) })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="fbOrder">Sort order</label>
                <input
                  id="fbOrder"
                  type="number"
                  value={draft.sortOrder ?? 0}
                  onChange={(e) =>
                    setDraft({ ...draft, sortOrder: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="fbQuote">Quote</label>
              <textarea
                id="fbQuote"
                rows={4}
                value={draft.quote || ""}
                onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
                required
              />
            </div>
            <label className="field-check">
              <input
                type="checkbox"
                checked={draft.active !== false}
                onChange={(e) =>
                  setDraft({ ...draft, active: e.target.checked })
                }
              />{" "}
              Active (visible on public site)
            </label>
            <div className="action-btns" style={{ marginTop: 16 }}>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setDraft(null);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      {toast ? <Toast message={toast} /> : null}
    </>
  );
}
