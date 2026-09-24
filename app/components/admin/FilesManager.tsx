"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ADMIN_FILES,
  ADMIN_PROFILE,
  FILES_KEY,
  appendAudit,
  loadJson,
  saveJson,
  type AdminFile,
} from "../../lib/admin-data";
import { CATEGORIES, FILE_TYPES, FILTER_BRANDS } from "../../lib/site-data";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminToolbar,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

export function FilesManager() {
  const [rows, setRows] = useState<AdminFile[]>(ADMIN_FILES);
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [verified, setVerified] = useState("");
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<AdminFile | null>(null);

  useEffect(() => {
    setRows(loadJson(FILES_KEY, ADMIN_FILES));
  }, []);

  const persist = (next: AdminFile[]) => {
    setRows(next);
    saveJson(FILES_KEY, next);
  };

  const filtered = useMemo(() => {
    return rows.filter((f) => {
      if (f.archived) return false;
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        f.model.toLowerCase().includes(query) ||
        f.brand.toLowerCase().includes(query);
      return (
        matchQ &&
        (!brand || f.brand === brand) &&
        (!type || f.type === type) &&
        (!category || f.category === category) &&
        (!verified ||
          (verified === "yes" ? f.verified : !f.verified))
      );
    });
  }, [rows, q, brand, type, category, verified]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const toggleVerified = (id: string) => {
    const next = rows.map((f) =>
      f.id === id ? { ...f, verified: !f.verified, updatedAt: today() } : f,
    );
    persist(next);
    const file = next.find((f) => f.id === id)!;
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "file.verify",
      target: id,
      detail: `${file.model} verified=${file.verified}`,
    });
    flash("Verification toggled");
  };

  const archive = (id: string) => {
    persist(
      rows.map((f) => (f.id === id ? { ...f, archived: true, updatedAt: today() } : f)),
    );
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "file.archive",
      target: id,
      detail: "Soft-deleted (demo)",
    });
    flash("Archived (demo)");
  };

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.model.trim()) return;
    const exists = rows.some((f) => f.id === editing.id);
    const next = exists
      ? rows.map((f) => (f.id === editing.id ? { ...editing, updatedAt: today() } : f))
      : [{ ...editing, updatedAt: today() }, ...rows];
    persist(next);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: exists ? "file.edit" : "file.create",
      target: editing.id,
      detail: `${editing.model} saved`,
    });
    setEditing(null);
    flash("File saved (demo — public library still uses static seed)");
  };

  return (
    <>
      <AdminPageHeader
        title="File Management"
        description="Create, verify, and archive library inventory. Public pages keep static seed unless wired later."
      />
      <AdminToolbar>
        <input
          placeholder="Search model / brand…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All brands</option>
          {FILTER_BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {FILE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={verified} onChange={(e) => setVerified(e.target.value)}>
          <option value="">Verified?</option>
          <option value="yes">Verified</option>
          <option value="no">Unverified</option>
        </select>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() =>
            setEditing({
              id: `file-${Date.now()}`,
              model: "",
              brand: "Dell",
              type: "BIOS bin",
              category: "bios-dumps",
              size: "8.0 MB",
              verified: false,
              description: "",
              updatedAt: today(),
            })
          }
        >
          Add file
        </button>
      </AdminToolbar>

      <AdminPanel title={`Files (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState title="No files" body="Adjust filters or add a file." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-files">
              <span>Model</span>
              <span>Brand</span>
              <span>Type</span>
              <span>Category</span>
              <span>Size</span>
              <span>Verified</span>
              <span>Actions</span>
            </div>
            {filtered.map((f) => (
              <div className="lib-row admin-row-files" key={f.id}>
                <span className="lib-model">{f.model}</span>
                <span>
                  <span className="tag tag-brand">{f.brand}</span>
                </span>
                <span>{f.type}</span>
                <span className="admin-cell-muted">{f.category}</span>
                <span>{f.size}</span>
                <span>
                  <StatusBadge status={f.verified ? "Verified" : "Pending"} />
                </span>
                <div className="action-btns">
                  <Link href={`/admin/files/${f.id}`} className="btn btn-success btn-sm">
                    Edit
                  </Link>
                  <Link href={`/library/${f.id}`} className="btn btn-purple btn-sm">
                    Public
                  </Link>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => toggleVerified(f.id)}
                  >
                    Toggle ✓
                  </button>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    onClick={() => archive(f.id)}
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </AdminTable>
        )}
      </AdminPanel>

      {editing ? (
        <AdminPanel
          title={rows.some((r) => r.id === editing.id) ? "Edit file" : "Create file"}
        >
          <form onSubmit={onSave} noValidate>
            <div className="portal-grid-2">
              <div className="field">
                <label>Model</label>
                <input
                  value={editing.model}
                  onChange={(e) => setEditing({ ...editing, model: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Brand</label>
                <select
                  value={editing.brand}
                  onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                >
                  {FILTER_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Type</label>
                <select
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                >
                  {FILE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Category</label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Size</label>
                <input
                  value={editing.size}
                  onChange={(e) => setEditing({ ...editing, size: e.target.value })}
                />
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={editing.verified}
                  onChange={(e) =>
                    setEditing({ ...editing, verified: e.target.checked })
                  }
                />
                Verified
              </label>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                rows={3}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </div>
            <div className="action-btns">
              <button type="submit" className="btn btn-success btn-sm">
                Save
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditing(null)}
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

function today() {
  return new Date().toISOString().slice(0, 10);
}
