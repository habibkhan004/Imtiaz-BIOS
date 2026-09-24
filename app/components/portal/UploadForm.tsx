"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent, type FormEvent } from "react";
import type { UploadRow } from "../../lib/portal-data";
import { FILTER_BRANDS, FILE_TYPES } from "../../lib/site-data";

const KEY = "imtiaz-portal-uploads";

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [brand, setBrand] = useState("Dell");
  const [model, setModel] = useState("");
  const [type, setType] = useState("BIOS bin");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);

  const applyFile = (file: File) => {
    if (file.size > 32 * 1024 * 1024) {
      setError("Max file size is 32MB.");
      return;
    }
    setError("");
    setFileName(file.name);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) applyFile(f);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      setError("Board / model is required.");
      return;
    }
    if (!fileName) {
      setError("Choose a file to upload.");
      return;
    }
    const row: UploadRow = {
      id: `UP-${70 + Math.floor(Math.random() * 40)}`,
      filename: fileName,
      model: model.trim().toUpperCase(),
      brand,
      type,
      notes,
      submittedAt: new Date().toISOString().slice(0, 10),
      status: "Queued",
    };
    let existing: UploadRow[] = [];
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) existing = JSON.parse(raw) as UploadRow[];
    } catch {
      /* ignore */
    }
    localStorage.setItem(KEY, JSON.stringify([row, ...existing]));
    setToast(true);
    setTimeout(() => router.push("/portal/uploads/mine"), 900);
  };

  return (
    <div className="portal-panel" style={{ maxWidth: 720 }}>
      <h2>Upload dump for review</h2>
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
          <h3>Drop .bin / .rom / .brd / .zip</h3>
          <p>Or click to browse. Max 32MB. Metadata only is stored in this demo.</p>
          <div className="dz-filename">{fileName}</div>
          <input
            ref={inputRef}
            type="file"
            className="hidden-input"
            accept=".bin,.rom,.wrl,.brd,.bdv,.zip"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) applyFile(f);
            }}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="uBrand">Brand</label>
            <select id="uBrand" value={brand} onChange={(e) => setBrand(e.target.value)}>
              {FILTER_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="uModel">Board / model</label>
            <input
              id="uModel"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="uType">File type</label>
          <select id="uType" value={type} onChange={(e) => setType(e.target.value)}>
            {FILE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
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
        <button className="btn btn-success btn-sm" type="submit">
          Submit for review
        </button>
      </form>
    </div>
  );
}
