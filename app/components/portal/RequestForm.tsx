"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FILE_REQUESTS, type FileRequest } from "../../lib/portal-data";
import { FILTER_BRANDS, FILE_TYPES } from "../../lib/site-data";
import { StatusBadge } from "./ui";

const KEY = "imtiaz-portal-requests";

function loadRequests(): FileRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as FileRequest[];
  } catch {
    /* ignore */
  }
  return FILE_REQUESTS;
}

export function RequestsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<FileRequest[]>(FILE_REQUESTS);
  const [brand, setBrand] = useState("Dell");
  const [model, setModel] = useState("");
  const [typeNeeded, setTypeNeeded] = useState("BIOS bin");
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setRows(loadRequests());
    const m = searchParams.get("model");
    if (m) setModel(m);
  }, [searchParams]);

  const sorted = useMemo(() => rows, [rows]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!model.trim()) return;
    const id = `FR-${1000 + sorted.length + Math.floor(Math.random() * 80)}`;
    const next: FileRequest = {
      id,
      model: model.trim().toUpperCase(),
      brand,
      typeNeeded,
      notes,
      status: "Pending",
      updatedAt: new Date().toISOString().slice(0, 10),
      timeline: [{ at: new Date().toISOString().slice(0, 10), text: "Request submitted" }],
    };
    const updated = [next, ...sorted];
    setRows(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setModel("");
    setNotes("");
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <>
      <div className="portal-panel">
        <h2>Create file request</h2>
        <form onSubmit={onSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="reqBrand">Brand</label>
              <select id="reqBrand" value={brand} onChange={(e) => setBrand(e.target.value)}>
                {FILTER_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="reqModel">Board / model</label>
              <input
                id="reqModel"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. LA-H994P"
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="reqType">Type needed</label>
            <select
              id="reqType"
              value={typeNeeded}
              onChange={(e) => setTypeNeeded(e.target.value)}
            >
              {FILE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="reqNotes">Notes</label>
            <textarea
              id="reqNotes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Fault, chip part, what you already tried…"
            />
          </div>
          <button className="btn btn-success btn-sm" type="submit">
            Submit request
          </button>
          {toast ? <div className="toast show">✅ Request added to your queue.</div> : null}
        </form>
      </div>

      <div className="portal-panel">
        <h2>Your requests</h2>
        <div className="lib-table portal-requests-table">
          <div className="lib-row head">
            <span>ID</span>
            <span>Board</span>
            <span>Brand</span>
            <span>Type</span>
            <span>Status</span>
            <span></span>
          </div>
          {sorted.map((r) => (
            <div
              className="lib-row"
              key={r.id}
              style={{ cursor: "pointer" }}
              onClick={() => router.push(`/portal/requests/${r.id}`)}
            >
              <span className="lib-model">{r.id}</span>
              <span>{r.model}</span>
              <span>
                <span className="tag tag-brand">{r.brand}</span>
              </span>
              <span>{r.typeNeeded}</span>
              <span>
                <StatusBadge status={r.status} />
              </span>
              <div className="action-btns">
                <Link
                  href={`/portal/requests/${r.id}`}
                  className="btn btn-success btn-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
