"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { StatusBadge } from "./ui";

type ApiRequest = {
  id: string;
  requestNumber: string;
  boardModel: string;
  brand: string;
  typeNeeded: string;
  status: string;
  updatedAt: string;
};

export function RequestsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<ApiRequest[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [typeNeeded, setTypeNeeded] = useState("BIOS");
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const load = () => {
    fetch("/api/requests/my", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.requests) setRows(data.requests);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    const m = searchParams.get("model");
    if (m) setModel(m);
    fetch("/api/brands", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const names = (data?.items || []).map((b: { name: string }) => b.name);
        setBrands(names);
        if (names[0]) setBrand(names[0]);
      })
      .catch(() => undefined);
    load();
  }, [searchParams]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!model.trim()) return;
    setPending(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          requestType: "file",
          brand,
          boardModel: model.trim().toUpperCase(),
          typeNeeded,
          description: notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit.");
        return;
      }
      setToast(`✅ ${data.request.requestNumber} created`);
      setModel("");
      setNotes("");
      load();
      setTimeout(() => setToast(""), 2500);
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
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
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
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
            <input
              id="reqType"
              value={typeNeeded}
              onChange={(e) => setTypeNeeded(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="reqNotes">Description</label>
            <textarea
              id="reqNotes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {error ? <div className="toast show error">{error}</div> : null}
          <button className="btn btn-success btn-sm" type="submit" disabled={pending}>
            {pending ? "Submitting…" : "Submit request"}
          </button>
          {toast ? <div className="toast show">{toast}</div> : null}
        </form>
      </div>

      <div className="portal-panel">
        <h2>Your requests</h2>
        {rows.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No requests yet.</p>
        ) : (
          <div className="lib-table portal-requests-table">
            <div className="lib-row head">
              <span>ID</span>
              <span>Model</span>
              <span>Type</span>
              <span>Status</span>
              <span />
            </div>
            {rows.map((r) => (
              <div className="lib-row" key={r.id}>
                <span className="lib-model">{r.requestNumber}</span>
                <span>
                  {r.brand} {r.boardModel}
                </span>
                <span>{r.typeNeeded}</span>
                <span>
                  <StatusBadge status={r.status} />
                </span>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => router.push(`/portal/requests/${r.id}`)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
        <Link href="/portal/support" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
          Technical / password support
        </Link>
      </div>
    </>
  );
}
