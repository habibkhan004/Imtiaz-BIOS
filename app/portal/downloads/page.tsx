"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, PortalPageHeader } from "../../components/portal/ui";
import {
  loadPortalDownloads,
  type DownloadRow,
} from "../../lib/portal-data";
import { FILE_TYPES } from "../../lib/site-data";

function redownload(model: string, type: string) {
  let ext = ".bin";
  if (type === "Boardview") ext = ".brd";
  else if (type === "Schematic") ext = ".wrl";
  const blob = new Blob(
    [`IMTIAZ BIOS DEMO\n${model}\n${type}\n`],
    { type: "application/octet-stream" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${model}${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DownloadsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [all, setAll] = useState<DownloadRow[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setAll(loadPortalDownloads());
  }, []);

  const rows = useMemo(() => {
    return all.filter((d) => {
      const matchQ = !q || d.model.toLowerCase().includes(q.toLowerCase());
      const matchT = !type || d.type === type;
      return matchQ && matchT;
    });
  }, [all, q, type]);

  return (
    <>
      <PortalPageHeader
        title="Download history"
        description="Re-download authorized files from your history, or search the library."
      />
      <div className="lib-toolbar" style={{ marginBottom: 16 }}>
        <input
          placeholder="Search model…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search downloads"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="">All types</option>
          {FILE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Link href={`/library${q ? `?q=${encodeURIComponent(q)}` : ""}`} className="btn btn-outline btn-sm">
          Search library
        </Link>
      </div>
      <div className="portal-panel">
        {rows.length === 0 ? (
          <EmptyState
            title="No authorized downloads"
            body="Browse the library while signed in to download entitled files."
            actionHref="/library"
            actionLabel="Open library"
          />
        ) : (
          <div className="lib-table">
            <div className="lib-row head">
              <span>Board / Model</span>
              <span>Brand</span>
              <span>Type</span>
              <span>Downloaded</span>
              <span>Actions</span>
            </div>
            {rows.map((d) => (
              <div className="lib-row" key={d.id}>
                <span className="lib-model">{d.model}</span>
                <span>
                  <span className="tag tag-brand">{d.brand}</span>
                </span>
                <span>{d.type}</span>
                <span>{d.downloadedAt}</span>
                <div className="action-btns">
                  <Link href={`/library/${d.fileId}`} className="btn btn-success btn-sm">
                    View
                  </Link>
                  <button
                    type="button"
                    className="btn btn-download btn-sm"
                    onClick={() => {
                      redownload(d.model, d.type);
                      setToast("✅ Re-download started");
                      setTimeout(() => setToast(""), 1800);
                    }}
                  >
                    Re-download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast ? <div className="toast show">{toast}</div> : null}
    </>
  );
}
