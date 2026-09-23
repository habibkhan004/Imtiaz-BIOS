"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ADMIN_CATEGORIES,
  ADMIN_FILES,
  ADMIN_PROFILE,
  CATEGORIES_KEY,
  FILES_KEY,
  appendAudit,
  loadJson,
  saveJson,
  type AdminCategory,
} from "../../lib/admin-data";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  EmptyState,
  Toast,
} from "./ui";

export function CategoriesManager() {
  const [rows, setRows] = useState<AdminCategory[]>(ADMIN_CATEGORIES);
  const [toast, setToast] = useState("");
  const [draft, setDraft] = useState<AdminCategory | null>(null);

  useEffect(() => {
    setRows(loadJson(CATEGORIES_KEY, ADMIN_CATEGORIES));
  }, []);

  const persist = (next: AdminCategory[]) => {
    setRows(next);
    saveJson(CATEGORIES_KEY, next);
  };

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };

  const move = (slug: string, dir: -1 | 1) => {
    const i = rows.findIndex((r) => r.slug === slug);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "category.reorder",
      target: slug,
      detail: `Moved ${dir < 0 ? "up" : "down"}`,
    });
  };

  const remove = (slug: string) => {
    const files = loadJson(FILES_KEY, ADMIN_FILES);
    const inUse = files.some((f) => f.category === slug && !f.archived);
    if (inUse) {
      flash("Cannot delete — files still use this category");
      return;
    }
    persist(rows.filter((r) => r.slug !== slug));
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "category.delete",
      target: slug,
      detail: "Category removed",
    });
    flash("Category deleted");
  };

  const fileCount = (slug: string) => {
    const files = loadJson(FILES_KEY, ADMIN_FILES);
    return files.filter((f) => f.category === slug && !f.archived).length;
  };

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    if (!draft?.name.trim() || !draft.slug.trim()) return;
    const exists = rows.some((r) => r.slug === draft.slug);
    const next = exists
      ? rows.map((r) => (r.slug === draft.slug ? draft : r))
      : [...rows, draft];
    persist(next);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "category.edit",
      target: draft.slug,
      detail: `${draft.name} saved`,
    });
    setDraft(null);
    flash("Category saved");
  };

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Manage library categories. Slug changes may break public /categories/[slug] links."
      />
      <p className="form-note" style={{ marginBottom: 16 }}>
        Demo note: public category pages still read static site-data unless wired later.
      </p>
      <AdminPanel
        title={`Categories (${rows.length})`}
        actions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() =>
              setDraft({
                slug: "",
                name: "",
                description: "",
                icon: "📁",
                visible: true,
              })
            }
          >
            Add category
          </button>
        }
      >
        {rows.length === 0 ? (
          <EmptyState title="No categories" body="Add a category to get started." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-categories">
              <span></span>
              <span>Name</span>
              <span>Slug</span>
              <span>Description</span>
              <span>Files</span>
              <span>Actions</span>
            </div>
            {rows.map((c) => (
              <div className="lib-row admin-row-categories" key={c.slug}>
                <span>{c.icon}</span>
                <span className="lib-model">{c.name}</span>
                <span className="admin-cell-date">{c.slug}</span>
                <span className="admin-cell-muted">{c.description}</span>
                <span>
                  {fileCount(c.slug)}
                </span>
                <div className="action-btns">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => move(c.slug, -1)}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-purple btn-sm"
                    onClick={() => move(c.slug, 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => setDraft(c)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(c.slug)}
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
        <AdminPanel title="Edit category">
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
                <label>Slug</label>
                <input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Icon</label>
                <input
                  value={draft.icon}
                  onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                />
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={draft.visible}
                  onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
                />
                Visible
              </label>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                rows={2}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
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
