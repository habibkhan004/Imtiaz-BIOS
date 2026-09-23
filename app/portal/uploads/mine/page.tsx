"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, PortalPageHeader, StatusBadge } from "../../../components/portal/ui";
import { UPLOADS, type UploadRow } from "../../../lib/portal-data";

const KEY = "imtiaz-portal-uploads";

export default function MyUploadsPage() {
  const [rows, setRows] = useState<UploadRow[]>(UPLOADS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const extra = JSON.parse(raw) as UploadRow[];
        setRows([...extra, ...UPLOADS]);
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
      <PortalPageHeader
        eyebrow="MY UPLOADS"
        title="Uploaded files"
        description="Track review status for dumps you submitted."
      />
      <div className="portal-panel">
        {rows.length === 0 ? (
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
                <span className="lib-model">{u.filename}</span>
                <span>{u.model}</span>
                <span>
                  <span className="tag tag-brand">{u.brand}</span>
                </span>
                <span>{u.submittedAt}</span>
                <span>
                  <StatusBadge status={u.status} />
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {u.techNote || "—"}
                  </div>
                  <Link
                    href={`/portal/support?model=${encodeURIComponent(u.model)}`}
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
      </div>
    </>
  );
}
