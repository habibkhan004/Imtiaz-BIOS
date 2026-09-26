"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";

type Cat = { id: string; name: string };
type Brand = { id: string; name: string };

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Cat[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [model, setModel] = useState("");
  const [boardNumber, setBoardNumber] = useState("");
  const [type, setType] = useState("BIOS");
  const [version, setVersion] = useState("1.0");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/brands", { credentials: "include" }).then((r) => r.json()),
    ]).then(([cats, brandsRes]) => {
      setCategories(cats.items || []);
      setBrands(brandsRes.items || []);
      if (cats.items?.[0]) setCategoryId(cats.items[0].id);
      if (brandsRes.items?.[0]) setBrandId(brandsRes.items[0].id);
    });
  }, []);

  const applyFile = (f: File) => {
    if (f.size > 50 * 1024 * 1024) {
      setError("Max file size is 50MB.");
      return;
    }
    setError("");
    setFile(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) applyFile(f);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!boardNumber.trim() && !model.trim()) {
      setError("Board / model is required.");
      return;
    }
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    if (!categoryId || !brandId) {
      setError("Category and brand are required.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("categoryId", categoryId);
      form.append("brandId", brandId);
      form.append("boardNumber", (boardNumber || model).trim().toUpperCase());
      form.append("modelNumber", model.trim());
      form.append("fileType", type);
      form.append("version", version);
      form.append("notes", notes);
      form.append("description", notes);
      const res = await fetch("/api/uploads", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }
      setToast(true);
      setTimeout(() => router.push("/portal/uploads/mine"), 900);
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="portal-panel" style={{ maxWidth: 720 }}>
      <h2>Upload dump for review</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
        Files stay private until an admin or technician approves them.
      </p>
      <form onSubmit={onSubmit}>
        <div
          className={`dropzone${drag ? " drag" : ""}`}
          style={{ minHeight: 160, marginBottom: 16, borderRadius: 12 }}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDrag(false);
          }}
          onDrop={onDrop}
        >
          <h3>Drop .bin / .rom / .bdv / .pdf / .zip</h3>
          <p>Validated extension, MIME, and size. Stored with a safe object key.</p>
          <div className="dz-filename">{file?.name || "No file selected"}</div>
          <input
            ref={inputRef}
            type="file"
            className="hidden-input"
            accept=".bin,.rom,.bdv,.pdf,.zip,.rar,.7z,.txt,.hex"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) applyFile(f);
            }}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="uBrand">Brand</label>
            <select
              id="uBrand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="uCat">Category</label>
            <select
              id="uCat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="uBoard">Board number</label>
            <input
              id="uBoard"
              value={boardNumber}
              onChange={(e) => setBoardNumber(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="uModel">Model</label>
            <input id="uModel" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="uType">File type</label>
            <input id="uType" value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="uVer">Version</label>
            <input
              id="uVer"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="uNotes">Notes</label>
          <textarea
            id="uNotes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        {error ? <div className="toast show error">{error}</div> : null}
        {toast ? <div className="toast show">✅ Upload queued — opening My Uploads…</div> : null}
        <button className="btn btn-success btn-sm" type="submit" disabled={pending}>
          {pending ? "Uploading…" : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
