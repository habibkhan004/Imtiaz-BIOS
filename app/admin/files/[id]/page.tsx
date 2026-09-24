"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ADMIN_FILES,
  ADMIN_PROFILE,
  FILES_KEY,
  appendAudit,
  getFile,
  loadJson,
  saveJson,
  type AdminFile,
} from "../../../lib/admin-data";
import { CATEGORIES, FILE_TYPES, FILTER_BRANDS } from "../../../lib/site-data";
import { AdminPageHeader } from "../../../components/admin/ui";

export default function AdminFileDetailPage() {
  const params = useParams<{ id: string }>();
  const [file, setFile] = useState<AdminFile | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const list = loadJson(FILES_KEY, ADMIN_FILES);
    setFile(list.find((f) => f.id === params.id) ?? getFile(params.id) ?? null);
  }, [params.id]);

  if (!file) {
    return (
      <p style={{ color: "var(--text-muted)" }}>
        File not found. <Link href="/admin/files">Back</Link>
      </p>
    );
  }

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    const list = loadJson(FILES_KEY, ADMIN_FILES);
    const next = list.some((f) => f.id === file.id)
      ? list.map((f) => (f.id === file.id ? file : f))
      : [file, ...list];
    saveJson(FILES_KEY, next);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "file.edit",
      target: file.id,
      detail: `Edited ${file.model}`,
    });
    setToast(true);
    setTimeout(() => setToast(false), 1800);
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="FILE"
        title={file.model}
        description="Edit library file metadata (demo localStorage)."
      />
      <form className="portal-panel" onSubmit={onSave}>
        <div className="portal-grid-2">
          <div className="field">
            <label>Model</label>
            <input
              value={file.model}
              onChange={(e) => setFile({ ...file, model: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Brand</label>
            <select
              value={file.brand}
              onChange={(e) => setFile({ ...file, brand: e.target.value })}
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
              value={file.type}
              onChange={(e) => setFile({ ...file, type: e.target.value })}
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
              value={file.category}
              onChange={(e) => setFile({ ...file, category: e.target.value })}
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
              value={file.size}
              onChange={(e) => setFile({ ...file, size: e.target.value })}
            />
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={file.verified}
              onChange={(e) => setFile({ ...file, verified: e.target.checked })}
            />
            Verified
          </label>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            rows={4}
            value={file.description}
            onChange={(e) => setFile({ ...file, description: e.target.value })}
          />
        </div>
        <div className="action-btns">
          <button type="submit" className="btn btn-success btn-sm">
            Save
          </button>
          <Link href={`/library/${file.id}`} className="btn btn-purple btn-sm">
            Public
          </Link>
          <Link href="/admin/files" className="btn btn-outline btn-sm">
            Back
          </Link>
        </div>
        <div className={`toast${toast ? " show" : ""}`}>✅ Saved</div>
      </form>
    </>
  );
}
