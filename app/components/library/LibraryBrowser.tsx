"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { readAuth } from "../../lib/auth";
import {
  CATEGORIES,
  FILE_TYPES,
  FILTER_BRANDS,
  LIBRARY_FILES,
  type LibraryFile,
} from "../../lib/site-data";

function filterFiles(
  files: LibraryFile[],
  q: string,
  brand: string,
  type: string,
  category: string,
  verifiedOnly: boolean,
) {
  const query = q.trim().toLowerCase();
  return files.filter((item) => {
    const matchSearch =
      !query ||
      item.model.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query);
    const matchBrand = !brand || item.brand === brand;
    const matchType = !type || item.type === type;
    const matchCategory = !category || item.category === category;
    const matchVerified = !verifiedOnly || item.verified;
    return matchSearch && matchBrand && matchType && matchCategory && matchVerified;
  });
}

function requestHref(model: string, loggedIn: boolean) {
  const q = `model=${encodeURIComponent(model)}`;
  if (loggedIn) return `/portal/requests?${q}`;
  return `/login?next=${encodeURIComponent(`/portal/requests?${q}`)}`;
}

export function LibraryBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loggedIn, setLoggedIn] = useState(false);

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [verifiedOnly, setVerifiedOnly] = useState(
    searchParams.get("verified") === "1",
  );

  useEffect(() => {
    const sync = () => setLoggedIn(Boolean(readAuth()));
    sync();
    window.addEventListener("imtiaz-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("imtiaz-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const syncUrl = useCallback(
    (next: {
      q?: string;
      brand?: string;
      type?: string;
      category?: string;
      verified?: boolean;
    }) => {
      const params = new URLSearchParams();
      const qq = next.q ?? q;
      const bb = next.brand ?? brand;
      const tt = next.type ?? type;
      const cc = next.category ?? category;
      const vv = next.verified ?? verifiedOnly;
      if (qq) params.set("q", qq);
      if (bb) params.set("brand", bb);
      if (tt) params.set("type", tt);
      if (cc) params.set("category", cc);
      if (vv) params.set("verified", "1");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [q, brand, type, category, verifiedOnly, pathname, router],
  );

  const filtered = useMemo(
    () => filterFiles(LIBRARY_FILES, q, brand, type, category, verifiedOnly),
    [q, brand, type, category, verifiedOnly],
  );

  const clearFilters = () => {
    setQ("");
    setBrand("");
    setType("");
    setCategory("");
    setVerifiedOnly(false);
    router.replace(pathname, { scroll: false });
  };

  const hasFilters = Boolean(q || brand || type || category || verifiedOnly);

  return (
    <div>
      <div className="lib-toolbar">
        <input
          type="text"
          placeholder="🔍 Search by board number, e.g. DA0X6..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            syncUrl({ q: e.target.value });
          }}
        />
        <select
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            syncUrl({ brand: e.target.value });
          }}
        >
          <option value="">All brands</option>
          {FILTER_BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            syncUrl({ type: e.target.value });
          }}
        >
          <option value="">All types</option>
          {FILE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            syncUrl({ category: e.target.value });
          }}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-secondary)",
            whiteSpace: "nowrap",
          }}
        >
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => {
              setVerifiedOnly(e.target.checked);
              syncUrl({ verified: e.target.checked });
            }}
          />
          Verified only
        </label>
        {hasFilters ? (
          <button type="button" className="btn btn-outline btn-sm" onClick={clearFilters}>
            Clear
          </button>
        ) : null}
        <span className="status-badge">
          {filtered.length} file{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="lib-table">
        <div className="lib-row head">
          <span>Board / Model</span>
          <span>Brand</span>
          <span>Type</span>
          <span>Size</span>
          <span>Actions</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-library">
            <p style={{ fontSize: 18, marginBottom: 8 }}>📭 No matches found</p>
            <p style={{ color: "var(--text-muted)" }}>
              Try another board number, or{" "}
              <Link
                href={
                  loggedIn
                    ? `/portal/requests${q ? `?model=${encodeURIComponent(q)}` : ""}`
                    : `/login?next=${encodeURIComponent(
                        `/portal/requests${q ? `?model=${encodeURIComponent(q)}` : ""}`,
                      )}`
                }
                style={{ color: "var(--accent-cyan)" }}
              >
                request a missing file
              </Link>
              .
            </p>
          </div>
        ) : (
          filtered.map((item, index) => (
            <div
              className="lib-row"
              key={item.id}
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <span className="lib-model">
                <Link href={`/library/${item.id}`} style={{ color: "inherit" }}>
                  {item.model}
                </Link>
              </span>
              <span>
                <span className="tag tag-brand">{item.brand}</span>
              </span>
              <span>{item.type}</span>
              <span>
                {item.size}{" "}
                {item.verified ? (
                  <span className="tag tag-verified">✓ verified</span>
                ) : null}
              </span>
              <div className="action-btns">
                <Link href={`/library/${item.id}`} className="btn btn-download btn-sm">
                  View
                </Link>
                <Link
                  href={requestHref(item.model, loggedIn)}
                  className="btn btn-request btn-sm"
                >
                  Request
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="form-note" style={{ marginTop: 20 }}>
        Missing a board number?{" "}
        <Link
          href={
            loggedIn
              ? "/portal/requests"
              : `/login?next=${encodeURIComponent("/portal/requests")}`
          }
          style={{ color: "var(--accent-cyan)" }}
        >
          Open a file request
        </Link>
        .
      </p>
    </div>
  );
}
