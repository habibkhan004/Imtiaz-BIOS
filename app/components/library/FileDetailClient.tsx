"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readAuth, type AuthSession } from "../../lib/auth";
import { addToCart } from "../../lib/cart";
import { recordPortalDownload } from "../../lib/portal-data";
import {
  downloadFileName,
  fileFormatFromName,
} from "../../lib/file-format";
import type { LibraryFile } from "../../lib/site-data";
import { CATEGORIES, LIBRARY_FILES } from "../../lib/site-data";

type FileMeta = {
  name?: string;
  originalName?: string;
  storageKey?: string;
  accessType?: string;
  price?: number;
  verificationStatus?: string;
  version?: string;
  boardNumber?: string;
  modelNumber?: string;
  fileType?: string;
  sizeBytes?: number;
  description?: string;
  compatibility?: string;
  tags?: string[];
  brandName?: string;
  categoryName?: string;
  entitlement?: { ok: boolean; reason: string; message?: string };
};

function formatSize(bytes?: number) {
  if (!bytes) return null;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

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
  const [meta, setMeta] = useState<FileMeta | null>(null);
  const [showCartLink, setShowCartLink] = useState(false);
  const category = CATEGORIES.find((c) => c.slug === file.category);
  const related = LIBRARY_FILES.filter(
    (f) =>
      f.id !== file.id &&
      (f.brand === file.brand || f.category === file.category),
  ).slice(0, 4);

  const flash = (msg: string, ms = 2500) => {
    setToast(msg);
    setTimeout(() => setToast(""), ms);
  };

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
          name: data.file.name,
          originalName: data.file.originalName,
          storageKey: data.file.storageKey,
          accessType: data.file.accessType,
          price: data.file.price,
          verificationStatus: data.file.verificationStatus,
          version: data.file.version,
          boardNumber: data.file.boardNumber,
          modelNumber: data.file.modelNumber,
          fileType: data.file.fileType,
          sizeBytes: data.file.sizeBytes,
          description: data.file.description,
          compatibility: data.file.compatibility,
          tags: data.file.tags,
          brandName: data.file.brandName,
          categoryName: data.file.categoryName,
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
  const fileKey = apiFileId || file.id;
  const price = Number(meta?.price ?? file.price ?? 0);
  const isPaid =
    price > 0 ||
    meta?.accessType === "paid" ||
    file.accessType === "paid";
  const entitled = Boolean(meta?.entitlement?.ok);
  /** Paid file not yet unlocked — show cart / pay CTAs */
  const paidBlocked = isPaid && !entitled;
  const description = meta?.description || file.description || "";
  const brand = meta?.brandName || file.brand;
  const version = meta?.version;
  const sizeLabel = formatSize(meta?.sizeBytes) || file.size;
  const verified =
    file.verified || meta?.verificationStatus === "verified";
  const format = fileFormatFromName(meta?.originalName, meta?.storageKey);
  const saveAs = downloadFileName(
    meta?.originalName,
    meta?.modelNumber || file.model || "download",
  );

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
          flash(data.error || "Pay to unlock this file.", 3000);
          return;
        }
        if (!res.ok) {
          flash("Download failed.");
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const cd = res.headers.get("Content-Disposition") || "";
        const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(cd);
        a.download = match?.[1]
          ? decodeURIComponent(match[1])
          : saveAs;
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
        flash("✅ Download started");
        return;
      } catch {
        flash("Network error during download.");
        return;
      }
    }

    const content = `IMTIAZ BIOS DUMP\nBoard: ${file.model}\nType: ${file.type}\n`;
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = saveAs;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    flash("✅ Download started (demo)");
  };

  const onAddToCart = () => {
    if (!isPaid) return;
    if (!loggedIn || !user) {
      router.push(loginNext);
      return;
    }
    const result = addToCart(
      {
        fileId: fileKey,
        name: meta?.name || file.model,
        model: meta?.modelNumber || file.model,
        brand,
        type: meta?.fileType || file.type,
        price,
        description,
      },
      user.userId,
    );
    if (result.ok) {
      setShowCartLink(true);
      flash("Added to cart");
    } else {
      flash(result.reason || "Already in cart");
      if (result.reason === "Already in cart") setShowCartLink(true);
    }
  };

  const checkoutHref = loggedIn
    ? `/checkout?fileId=${encodeURIComponent(fileKey)}`
    : `/login?next=${encodeURIComponent(`/checkout?fileId=${fileKey}`)}`;

  return (
    <div className="wrap">
      <div className="section-head reveal" style={{ maxWidth: 900 }}>
        <span className="eyebrow">FILE DETAILS</span>
        <h2>
          <span className="gradient-cyan">{file.model}</span>
        </h2>
        <p>
          {meta?.fileType || file.type} · {brand} · {sizeLabel}
          {version ? ` · v${version}` : ""}
          {verified ? " · verified" : " · pending verification"}
        </p>
      </div>

      <div className="product-detail reveal">
        <div className="product-main">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <span className={`file-format-badge tone-${format.tone}`}>
              {format.label}
            </span>
            <span className="tag tag-brand">{brand}</span>
            {verified ? (
              <span className="tag tag-verified">✓ verified</span>
            ) : (
              <span className="tag">{meta?.verificationStatus || "pending"}</span>
            )}
            {isPaid ? (
              <span className="tag">Payment required</span>
            ) : (
              <span className="tag tag-verified">Free</span>
            )}
          </div>

          <h2 style={{ marginTop: 8, fontSize: 28 }}>{meta?.name || file.model}</h2>

          <div className="product-meta-grid">
            <div className="product-meta-item">
              <span>Model</span>
              <strong>{meta?.modelNumber || file.model}</strong>
            </div>
            <div className="product-meta-item">
              <span>Board</span>
              <strong>{meta?.boardNumber || "—"}</strong>
            </div>
            <div className="product-meta-item">
              <span>Content type</span>
              <strong>{meta?.fileType || file.type}</strong>
            </div>
            <div className="product-meta-item">
              <span>File format</span>
              <strong>
                <span className={`file-format-badge tone-${format.tone}`}>
                  {format.label}
                </span>
              </strong>
            </div>
            <div className="product-meta-item">
              <span>Version</span>
              <strong>{version || "—"}</strong>
            </div>
            <div className="product-meta-item">
              <span>Size</span>
              <strong>{sizeLabel}</strong>
            </div>
            <div className="product-meta-item">
              <span>Category</span>
              <strong>{meta?.categoryName || category?.name || file.category}</strong>
            </div>
            {meta?.originalName ? (
              <div className="product-meta-item">
                <span>Filename</span>
                <strong className="file-original-name">{meta.originalName}</strong>
              </div>
            ) : null}
          </div>

          {description ? (
            <div className="product-desc">
              <span className="eyebrow">DESCRIPTION</span>
              <p style={{ marginTop: 10 }}>{description}</p>
            </div>
          ) : null}

          {meta?.compatibility ? (
            <div className="product-desc">
              <span className="eyebrow">COMPATIBILITY</span>
              <p style={{ marginTop: 10 }}>{meta.compatibility}</p>
            </div>
          ) : null}

          {meta?.tags?.length ? (
            <p style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {meta.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </p>
          ) : null}
        </div>

        <aside className="product-buy">
          <span className="eyebrow">PURCHASE</span>
          <div className="product-buy-format">
            <span className={`file-format-badge tone-${format.tone} is-lg`}>
              {format.label}
            </span>
            <span className="product-buy-format-label">File format</span>
          </div>
          <div className="product-price">
            {isPaid ? `$${price.toFixed(2)}` : "Free"}
          </div>
          <p className="product-price-note">
            {isPaid
              ? "One-time unlock for this file after payment."
              : "Signed-in users can download at no charge."}
          </p>

          <div className="product-actions">
            {paidBlocked ? (
              <>
                <button type="button" className="btn btn-outline" onClick={onAddToCart}>
                  Add to cart
                </button>
                <Link href={checkoutHref} className="btn btn-primary">
                  Proceed to payment
                </Link>
                {!loggedIn ? (
                  <Link href={loginNext} className="btn btn-ghost">
                    Sign in first
                  </Link>
                ) : null}
                {showCartLink && loggedIn ? (
                  <Link href="/cart" className="btn btn-ghost">
                    View cart
                  </Link>
                ) : null}
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {meta?.entitlement && "message" in meta.entitlement
                    ? meta.entitlement.message
                    : "Pay this file’s price to unlock download."}
                </p>
              </>
            ) : (
              <button type="button" className="btn btn-primary" onClick={onDownload}>
                {loggedIn
                  ? entitled || !isPaid
                    ? "Download"
                    : "Download"
                  : "Sign in to download"}
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
        </aside>
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
