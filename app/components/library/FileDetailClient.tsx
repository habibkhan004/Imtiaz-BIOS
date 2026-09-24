"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readAuth, type AuthSession } from "../../lib/auth";
import { recordPortalDownload } from "../../lib/portal-data";
import type { LibraryFile } from "../../lib/site-data";
import { CATEGORIES, LIBRARY_FILES } from "../../lib/site-data";

export function FileDetailClient({
  file,
  apiFileId,
}: {
  file: LibraryFile;
  apiFileId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [toast, setToast] = useState("");
  const [meta, setMeta] = useState<{
    accessType?: string;
    price?: number;
    verificationStatus?: string;
    version?: string;
    entitlement?: { ok: boolean; reason: string; message?: string };
  } | null>(null);
  const category = CATEGORIES.find((c) => c.slug === file.category);
  const related = LIBRARY_FILES.filter(
    (f) =>
      f.id !== file.id &&
      (f.brand === file.brand || f.category === file.category),
  ).slice(0, 4);

  useEffect(() => {
    const sync = () => setUser(readAuth());
    sync();
    window.addEventListener("imtiaz-auth-change", sync);
    return () => window.removeEventListener("imtiaz-auth-change", sync);
  }, []);

  useEffect(() => {
    if (!apiFileId || apiFileId.length < 20) return;
    fetch(`/api/files/${apiFileId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.file) return;
        setMeta({
          accessType: data.file.accessType,
          price: data.file.price,
          verificationStatus: data.file.verificationStatus,
          version: data.file.version,
          entitlement: data.entitlement,
        });
      })
      .catch(() => undefined);
  }, [apiFileId]);

  const loggedIn = Boolean(user);
  const loginNext = `/login?next=${encodeURIComponent(pathname)}`;
  const requestPath = `/portal/requests?model=${encodeURIComponent(file.model)}`;
  const requestHref = loggedIn
    ? requestPath
    : `/login?next=${encodeURIComponent(requestPath)}`;
  const canDownload =
    meta?.entitlement?.ok ||
    (!meta && (user?.role === "customer" || user?.role === "admin"));

  const onDownload = async () => {
    if (!loggedIn) {
      router.push(loginNext);
      return;
    }
    if (apiFileId && apiFileId.length >= 20) {
      try {
        const res = await fetch(`/api/files/${apiFileId}/download`, {
          credentials: "include",
        });
        if (res.status === 401) {
          router.push(loginNext);
          return;
        }
        if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          setToast(data.error || "Subscribe or purchase to download.");
          setTimeout(() => setToast(""), 3000);
          return;
        }
        if (!res.ok) {
          setToast("Download failed.");
          setTimeout(() => setToast(""), 2500);
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.model}.bin`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (user?.role === "customer") {
          recordPortalDownload({
            fileId: file.id,
            model: file.model,
            brand: file.brand,
            type: file.type,
          });
        }
        setToast("✅ Authorized download started");
        setTimeout(() => setToast(""), 2000);
        return;
      } catch {
        setToast("Network error during download.");
        setTimeout(() => setToast(""), 2500);
        return;
      }
    }

    if (!canDownload) {
      setToast("Log in or register as a customer to download.");
      setTimeout(() => setToast(""), 2500);
      return;
    }
    const content = `IMTIAZ BIOS DUMP\nBoard: ${file.model}\nType: ${file.type}\n`;
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.model}.bin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (user?.role === "customer") {
      recordPortalDownload({
        fileId: file.id,
        model: file.model,
        brand: file.brand,
        type: file.type,
      });
    }
    setToast("✅ Download started (demo)");
    setTimeout(() => setToast(""), 2000);
  };

  const paidBlocked =
    meta &&
    meta.accessType === "paid" &&
    meta.entitlement &&
    !meta.entitlement.ok;

  return (
    <div className="wrap">
      <div className="section-head reveal" style={{ maxWidth: 800 }}>
        <span className="eyebrow">FILE DETAILS</span>
        <h2>
          <span className="gradient-cyan">{file.model}</span>
        </h2>
        <p>
          {file.type} · {file.brand} · {file.size}
          {meta?.version ? ` · v${meta.version}` : ""}
          {file.verified || meta?.verificationStatus === "verified"
            ? " · verified"
            : " · pending verification"}
          {meta?.accessType === "paid"
            ? ` · paid $${meta.price ?? 0}`
            : meta?.accessType === "free"
              ? " · free"
              : ""}
        </p>
      </div>

      <div className="contact-box reveal" style={{ marginBottom: 40 }}>
        <div className="contact-info">
          <span className="eyebrow">BOARD INFO</span>
          <h2 style={{ marginTop: 12 }}>{file.model}</h2>
          <p style={{ marginTop: 14 }}>
            <span className="tag tag-brand">{file.brand}</span>{" "}
            {file.verified || meta?.verificationStatus === "verified" ? (
              <span className="tag tag-verified">✓ verified</span>
            ) : (
              <span className="tag">{meta?.verificationStatus || "pending"}</span>
            )}
          </p>
          <p style={{ marginTop: 16, color: "var(--text-secondary)" }}>
            {file.description}
          </p>
          {category ? (
            <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>
              Category: {category.name}
            </p>
          ) : null}
        </div>
        <div>
          <span className="eyebrow">ACTIONS</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            {paidBlocked ? (
              <>
                <Link href="/portal/subscription" className="btn btn-primary">
                  Subscribe / purchase
                </Link>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {meta?.entitlement && "message" in meta.entitlement
                    ? meta.entitlement.message
                    : "Paid resource — entitlement required."}
                </p>
              </>
            ) : (
              <button type="button" className="btn btn-primary" onClick={onDownload}>
                {loggedIn ? "Download" : "Sign in to download"}
              </button>
            )}
            <Link href={requestHref} className="btn btn-ghost">
              Request variant
            </Link>
            <Link href="/library" className="btn btn-ghost">
              Back to library
            </Link>
          </div>
          {toast ? (
            <div className="toast show" style={{ marginTop: 16 }}>
              {toast}
            </div>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <div className="reveal">
          <h3 style={{ marginBottom: 16 }}>Related files</h3>
          <div className="file-grid">
            {related.map((r) => (
              <Link key={r.id} href={`/library/${r.id}`} className="file-card">
                <strong>{r.model}</strong>
                <span>
                  {r.brand} · {r.type}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
