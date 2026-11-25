"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminPageHeader, StatusBadge, Toast } from "../../../components/admin/ui";

type ApiFile = {
  id: string;
  name: string;
  originalName: string;
  storageKey: string;
  modelNumber: string;
  boardNumber: string;
  fileType: string;
  version: string;
  sizeBytes: number;
  description: string;
  status: string;
  verificationStatus: string;
  accessType: "free" | "paid" | string;
  price: number;
  brandName?: string;
  categoryName?: string;
  downloadUrl: string;
};

export default function AdminFileDetailPage() {
  const params = useParams<{ id: string }>();
  const [file, setFile] = useState<ApiFile | null>(null);
  const [error, setError] = useState("");
  const [accessOption, setAccessOption] = useState<"free" | "payment">("free");
  const [price, setPrice] = useState("9.99");
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState("");

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    fetch(`/api/files/${params.id}`, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Not found");
          return;
        }
        const f = data.file as ApiFile;
        setFile(f);
        const isPayment = f.accessType === "paid" || Number(f.price) > 0;
        setAccessOption(isPayment ? "payment" : "free");
        setPrice(String(isPayment && f.price > 0 ? f.price : 9.99));
      })
      .catch(() => setError("Network error"));
  }, [params.id]);

  const saveAccess = async () => {
    if (!file) return;
    const priceNum = accessOption === "payment" ? Number(price) : 0;
    if (accessOption === "payment" && (!(priceNum > 0) || Number.isNaN(priceNum))) {
      flash("Payment files need a price greater than 0");
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/files/${file.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessType: accessOption === "payment" ? "paid" : "free",
          price: priceNum,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        flash(data.error || "Update failed");
        return;
      }
      setFile(data.file);
      flash("Access updated");
    } catch {
      flash("Network error");
    } finally {
      setPending(false);
    }
  };

  if (error || !file) {
    return (
      <p style={{ color: "var(--text-muted)" }}>
        {error || "Loading…"}{" "}
        <Link href="/admin/files">Back</Link>
      </p>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={file.name}
        description="Binary on disk · link stored in MySQL FileAsset.storageKey"
      />
      <div className="portal-panel">
        <p style={{ marginBottom: 12 }}>
          Status: <StatusBadge status={file.status} /> · Verified:{" "}
          <StatusBadge status={file.verificationStatus} />
        </p>
        <p style={{ fontSize: 14 }}>
          Model: <strong>{file.modelNumber || "—"}</strong>
          <br />
          Board: <strong>{file.boardNumber || "—"}</strong>
          <br />
          Brand: <strong>{file.brandName || "—"}</strong>
          <br />
          Category: <strong>{file.categoryName || "—"}</strong>
          <br />
          Type / version:{" "}
          <strong>
            {file.fileType} {file.version}
          </strong>
          <br />
          Original name: <strong>{file.originalName}</strong>
          <br />
          Storage key (folder file name):{" "}
          <strong style={{ wordBreak: "break-all" }}>{file.storageKey}</strong>
          <br />
          Disk folder: <strong>.data/objects/</strong>
          <br />
          Download link:{" "}
          <a href={file.downloadUrl} style={{ color: "var(--accent-cyan)" }}>
            {file.downloadUrl}
          </a>
        </p>
        <p style={{ marginTop: 12, fontSize: 14 }}>{file.description || "—"}</p>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border, #333)" }}>
          <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Access</h3>
          <div className="portal-grid-2">
            <div className="field">
              <label>Option</label>
              <select
                value={accessOption}
                onChange={(e) =>
                  setAccessOption(e.target.value === "payment" ? "payment" : "free")
                }
              >
                <option value="free">Free</option>
                <option value="payment">Payment</option>
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
                />
              </div>
            ) : null}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            {accessOption === "payment"
              ? "Users must pay this price before they can download."
              : "No price — signed-in users can download freely."}
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={pending}
            onClick={saveAccess}
          >
            {pending ? "Saving…" : "Save access"}
          </button>
        </div>

        <div className="action-btns" style={{ marginTop: 16 }}>
          <a href={file.downloadUrl} className="btn btn-success btn-sm">
            Download file
          </a>
          <Link href="/admin/files" className="btn btn-outline btn-sm">
            Back
          </Link>
        </div>
      </div>
      <Toast message={toast} />
    </>
  );
}
