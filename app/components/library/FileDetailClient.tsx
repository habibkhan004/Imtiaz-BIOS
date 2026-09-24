"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readAuth, type AuthSession } from "../../lib/auth";
import { recordPortalDownload } from "../../lib/portal-data";
import type { LibraryFile } from "../../lib/site-data";
import { CATEGORIES, LIBRARY_FILES } from "../../lib/site-data";

function simulateDownload(file: LibraryFile) {
  let ext = ".bin";
  if (file.type === "Boardview") ext = ".brd";
  else if (file.type === "Schematic") ext = ".wrl";
  else if (file.type === "EC firmware") ext = ".bin";
  const content = `IMTIAZ BIOS DUMP\nBoard: ${file.model}\nType: ${file.type}\nGenerated: ${new Date().toISOString()}\n`;
  const blob = new Blob([content], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${file.model}${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function FileDetailClient({ file }: { file: LibraryFile }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [toast, setToast] = useState("");
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

  const loggedIn = Boolean(user);
  const canDownload = user?.role === "customer" || user?.role === "admin";
  const loginNext = `/login?next=${encodeURIComponent(pathname)}`;
  const requestPath = `/portal/requests?model=${encodeURIComponent(file.model)}`;
  const requestHref = loggedIn
    ? requestPath
    : `/login?next=${encodeURIComponent(requestPath)}`;

  const onDownload = () => {
    if (!loggedIn) {
      router.push(loginNext);
      return;
    }
    if (!canDownload) {
      setToast("Log in or register as a customer to download.");
      setTimeout(() => setToast(""), 2500);
      return;
    }
    simulateDownload(file);
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

  return (
    <div className="wrap">
      <div className="section-head reveal" style={{ maxWidth: 800 }}>
        <span className="eyebrow">FILE DETAILS</span>
        <h2>
          <span className="gradient-cyan">{file.model}</span>
        </h2>
        <p>
          {file.type} · {file.brand} · {file.size}
          {file.verified ? " · verified on real boards" : " · pending verification"}
        </p>
      </div>

      <div className="contact-box reveal" style={{ marginBottom: 40 }}>
        <div className="contact-info">
          <span className="eyebrow">BOARD INFO</span>
          <h2 style={{ marginTop: 12 }}>{file.model}</h2>
          <p style={{ marginTop: 14 }}>
            <span className="tag tag-brand">{file.brand}</span>{" "}
            {file.verified ? (
              <span className="tag tag-verified">✓ verified</span>
            ) : null}
          </p>
          <p>
            Type: <strong>{file.type}</strong>
            <br />
            Category:{" "}
            <Link
              href={`/categories/${file.category}`}
              style={{ color: "var(--accent-cyan)" }}
            >
              {category?.name ?? file.category}
            </Link>
            <br />
            Size: <strong>{file.size}</strong>
          </p>
          <p>{file.description}</p>
          <div className="hero-actions" style={{ marginBottom: 0 }}>
            {canDownload ? (
              <button type="button" className="btn btn-primary" onClick={onDownload}>
                ⬇ Download (demo)
              </button>
            ) : (
              <Link href={loginNext} className="btn btn-primary">
                ⬇ Log in to download
              </Link>
            )}
            <Link href={requestHref} className="btn btn-outline">
              📩 Request this board
            </Link>
            <Link href="/library" className="btn btn-outline">
              ← Back to library
            </Link>
          </div>
          <p className="form-note">
            {canDownload
              ? "Downloads are simulated in this demo build."
              : "Log in or register to continue — downloads require an account."}
          </p>
          {toast ? <div className="toast show">{toast}</div> : null}
        </div>
        <div>
          <span className="eyebrow">RELATED FILES</span>
          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            {related.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                No related files yet.
              </p>
            ) : (
              related.map((r) => (
                <Link
                  key={r.id}
                  href={`/library/${r.id}`}
                  className="brand-card"
                  style={{ textAlign: "left", padding: "16px 18px" }}
                >
                  <h3 style={{ fontSize: 15 }}>{r.model}</h3>
                  <p>
                    {r.brand} · {r.type}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
