"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  AdminToolbar,
  EmptyState,
  StatusBadge,
  Toast,
} from "./ui";

type ApiFile = {
  id: string;
  name: string;
  originalName: string;
  storageKey: string;
  boardNumber: string;
  modelNumber: string;
  fileType: string;
  version: string;
  sizeBytes: number;
  description: string;
  status: string;
  verificationStatus: string;
  accessType: string;
  price: number;
  brandName?: string;
  categoryName?: string;
  brandId: string;
  categoryId: string;
  downloadUrl: string;
  createdAt: string;
};

type Cat = { id: string; name: string; slug: string };
type Brand = { id: string; name: string };

function formatSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function FilesManager() {
  const [rows, setRows] = useState<ApiFile[]>([]);
  const [categories, setCategories] = useState<Cat[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [q, setQ] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState(false);

  const [name, setName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [boardNumber, setBoardNumber] = useState("");
  const [fileType, setFileType] = useState("BIOS");
  const [version, setVersion] = useState("1.0");
  const [description, setDescription] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [verified, setVerified] = useState(true);
  const [accessOption, setAccessOption] = useState<"free" | "payment">("free");
  const [price, setPrice] = useState("9.99");
  const [file, setFile] = useState<File | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [filesRes, catRes, brandRes] = await Promise.all([
        fetch("/api/admin/files?limit=100", { credentials: "include" }),
        fetch("/api/categories", { credentials: "include" }),
        fetch("/api/brands", { credentials: "include" }),
      ]);
      const filesData = await filesRes.json();
      const catData = await catRes.json();
      const brandData = await brandRes.json();
      if (!filesRes.ok) {
        setError(filesData.error || "Failed to load files");
        return;
      }
      setRows(filesData.items || []);
      setCategories(catData.items || []);
      setBrands(brandData.items || []);
      if (!formCategoryId && catData.items?.[0]) setFormCategoryId(catData.items[0].id);
      if (!formBrandId && brandData.items?.[0]) setFormBrandId(brandData.items[0].id);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [formBrandId, formCategoryId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) resetForm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showForm, pending]);

  const filtered = useMemo(() => {
    return rows.filter((f) => {
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        f.name.toLowerCase().includes(query) ||
        f.modelNumber.toLowerCase().includes(query) ||
        f.boardNumber.toLowerCase().includes(query) ||
        (f.brandName || "").toLowerCase().includes(query);
      return (
        matchQ &&
        (!brandId || f.brandId === brandId) &&
        (!categoryId || f.categoryId === categoryId)
      );
    });
  }, [rows, q, brandId, categoryId]);

  const resetForm = () => {
    setName("");
    setModelNumber("");
    setBoardNumber("");
    setFileType("BIOS");
    setVersion("1.0");
    setDescription("");
    setVerified(true);
    setAccessOption("free");
    setPrice("9.99");
    setFile(null);
    setShowForm(false);
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      flash("Name is required");
      return;
    }
    if (!file) {
      flash("Choose a file to store on disk");
      return;
    }
    if (!formCategoryId || !formBrandId) {
      flash("Category and brand are required");
      return;
    }
    const priceNum = accessOption === "payment" ? Number(price) : 0;
    if (accessOption === "payment" && (!(priceNum > 0) || Number.isNaN(priceNum))) {
      flash("Payment files need a price greater than 0");
      return;
    }
    setPending(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("name", name.trim());
      form.append("categoryId", formCategoryId);
      form.append("brandId", formBrandId);
      form.append("modelNumber", modelNumber.trim() || name.trim());
      form.append("boardNumber", boardNumber.trim() || modelNumber.trim() || name.trim());
      form.append("fileType", fileType);
      form.append("version", version);
      form.append("description", description);
      form.append("verified", verified ? "true" : "false");
      form.append("publish", "true");
      form.append("accessType", accessOption === "payment" ? "paid" : "free");
      form.append("price", String(priceNum));

      const res = await fetch("/api/files", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Upload failed");
        return;
      }
      flash(`Saved — download: ${data.file.downloadUrl}`);
      resetForm();
      await load();
    } catch {
      flash("Network error");
    } finally {
      setPending(false);
    }
  };

  const archive = async (id: string) => {
    setPending(true);
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Archive failed");
        return;
      }
      flash("Archived");
      await load();
    } catch {
      flash("Network error");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="File Management"
        description="Upload stores the binary in .data/objects and saves the link (storageKey + download URL) in MySQL FileAsset."
      />
      {error ? <div className="toast show error">{error}</div> : null}
      <AdminToolbar>
        <input
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-outline btn-sm" onClick={load}>
          Refresh
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(true)}
        >
          Add file
        </button>
      </AdminToolbar>

      <AdminPanel title={`Files (${filtered.length})`}>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="No files" body="Add a file to store it on disk and in MySQL." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-files">
              <span>Name / Model</span>
              <span>Brand</span>
              <span>Type</span>
              <span>Access</span>
              <span>Size</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {filtered.map((f) => (
              <div className="lib-row admin-row-files" key={f.id}>
                <span className="lib-model">
                  {f.name}
                  <br />
                  <span className="admin-cell-muted">{f.modelNumber || f.boardNumber}</span>
                </span>
                <span>
                  <span className="tag tag-brand">{f.brandName || "—"}</span>
                </span>
                <span>{f.fileType}</span>
                <span>
                  {f.price > 0 ? (
                    <span className="tag">Paid ${Number(f.price).toFixed(2)}</span>
                  ) : (
                    <span className="tag tag-verified">Free</span>
                  )}
                </span>
                <span>{formatSize(f.sizeBytes)}</span>
                <span>
                  <StatusBadge status={f.status} />
                </span>
                <div className="action-btns">
                  <a href={f.downloadUrl} className="btn btn-success btn-sm">
                    Download
                  </a>
                  <Link href={`/library/${f.id}`} className="btn btn-purple btn-sm">
                    Public
                  </Link>
                  <Link href={`/admin/files/${f.id}`} className="btn btn-outline btn-sm">
                    Open
                  </Link>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    disabled={pending || f.status === "archived"}
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

      {showForm ? (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) resetForm();
          }}
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-file-title"
          >
            <div className="admin-modal-head">
              <h2 id="add-file-title">Upload file</h2>
              <button
                type="button"
                className="admin-modal-close"
                aria-label="Close"
                disabled={pending}
                onClick={resetForm}
              >
                ×
              </button>
            </div>
            <form onSubmit={onSave} noValidate className="admin-modal-body">
              <div className="portal-grid-2">
                <div className="field">
                  <label>Display name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="field">
                  <label>File *</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Model number</label>
                  <input
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Board number</label>
                  <input
                    value={boardNumber}
                    onChange={(e) => setBoardNumber(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Brand</label>
                  <select
                    value={formBrandId}
                    onChange={(e) => setFormBrandId(e.target.value)}
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Category</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Type</label>
                  <input value={fileType} onChange={(e) => setFileType(e.target.value)} />
                </div>
                <div className="field">
                  <label>Version</label>
                  <input value={version} onChange={(e) => setVersion(e.target.value)} />
                </div>
                <div className="field">
                  <label>Access *</label>
                  <select
                    value={accessOption}
                    onChange={(e) =>
                      setAccessOption(e.target.value === "payment" ? "payment" : "free")
                    }
                  >
                    <option value="free">Free — users can download without paying</option>
                    <option value="payment">Payment — users must pay to unlock</option>
                  </select>
                </div>
                {accessOption === "payment" ? (
                  <div className="field">
                    <label>Price (USD) *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                ) : null}
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <label style={{ display: "flex", gap: 8, marginBottom: 14, fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                />
                Mark verified
              </label>
              <div className="action-btns admin-modal-actions">
                <button type="submit" className="btn btn-success btn-sm" disabled={pending}>
                  {pending ? "Saving…" : "Save to folder + DB"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={pending}
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <Toast message={toast} />
    </>
  );
}
