"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, PortalPageHeader, StatusBadge } from "../../../components/portal/ui";

type ApiUpload = {
  id: string;
  originalName: string;
  boardNumber: string;
  modelNumber: string;
  brandId: string;
  fileType: string;
  status: string;
  reviewNote?: string;
  createdAt: string;
};

type Brand = { id: string; name: string };

export default function MyUploadsPage() {
  const [rows, setRows] = useState<ApiUpload[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [uploadsRes, brandsRes] = await Promise.all([
          fetch("/api/uploads/my", { credentials: "include" }),
          fetch("/api/brands", { credentials: "include" }),
        ]);
        if (uploadsRes.status === 401) {
          setError("Sign in to see your uploads.");
          setRows([]);
          return;
        }
        const uploadsData = await uploadsRes.json();
        const brandsData = brandsRes.ok ? await brandsRes.json() : { items: [] };
        if (cancelled) return;
        if (!uploadsRes.ok) {
          setError(uploadsData.error || "Failed to load uploads.");
          return;
        }
        setRows(uploadsData.items || []);
        setBrands(brandsData.items || []);
      } catch {
        if (!cancelled) setError("Network error loading uploads.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const brandName = (id: string) => brands.find((b) => b.id === id)?.name || "—";

  return (
    <>
      <PortalPageHeader
        eyebrow="MY UPLOADS"
        title="Uploaded files"
        description="Track review status for dumps you submitted."
      />
      <div className="portal-panel">
        {error ? <div className="toast show error">{error}</div> : null}
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading uploads…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No uploads yet"
            body="Submit a dump for technician verification."
            actionHref="/portal/uploads"
            actionLabel="Upload file"
          />
        ) : (
          <div className="lib-table">
            <div className="lib-row head">
              <span>Filename</span>
              <span>Board</span>
              <span>Brand</span>
              <span>Submitted</span>
              <span>Status</span>
            </div>
            {rows.map((u) => (
              <div className="lib-row" key={u.id}>
                <span className="lib-model">{u.originalName}</span>
                <span>{u.boardNumber || u.modelNumber || "—"}</span>
                <span>
                  <span className="tag tag-brand">{brandName(u.brandId)}</span>
                </span>
                <span>{new Date(u.createdAt).toLocaleString()}</span>
                <span>
                  <StatusBadge status={u.status} />
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {u.reviewNote || "—"}
                  </div>
                  <Link
                    href={`/portal/support?model=${encodeURIComponent(u.boardNumber || u.modelNumber || "")}`}
                    className="btn btn-gold btn-sm"
                    style={{ marginTop: 6 }}
                  >
                    Request support
                  </Link>
                </span>
              </div>
            ))}
          </div>
        )}
        <Link href="/portal/uploads" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
          Upload another file
        </Link>
      </div>
    </>
  );
}
