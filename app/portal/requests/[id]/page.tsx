"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PortalPageHeader,
  StatusBadge,
} from "../../../components/portal/ui";
import { findPortalRequest, type FileRequest } from "../../../lib/portal-data";

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<FileRequest | null | undefined>(undefined);

  useEffect(() => {
    setRow(findPortalRequest(params.id) ?? null);
  }, [params.id]);

  if (row === undefined) {
    return <p style={{ color: "var(--text-muted)" }}>Loading request…</p>;
  }

  if (!row) {
    return (
      <div className="portal-panel">
        <p>Request not found.</p>
        <Link href="/portal/requests" className="btn btn-outline btn-sm">
          Back to requests
        </Link>
      </div>
    );
  }

  return (
    <>
      <PortalPageHeader
        title={`${row.id} · ${row.model}`}
        description={`${row.brand} · ${row.typeNeeded}`}
        backFallback="/portal/requests"
      />
      <div className="portal-panel">
        <p style={{ marginBottom: 12 }}>
          Status: <StatusBadge status={row.status} />
        </p>
        <h2>Notes</h2>
        <p style={{ color: "var(--text-secondary)" }}>{row.notes || "—"}</p>
        <h2 style={{ marginTop: 20 }}>Timeline</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {row.timeline.map((t) => (
            <div
              key={`${t.at}-${t.text}`}
              style={{
                padding: "10px 12px",
                border: "1px solid var(--border-color)",
                borderRadius: 10,
                background: "var(--bg-card)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "var(--mono)",
                  color: "var(--text-muted)",
                }}
              >
                {t.at}
              </div>
              <div>{t.text}</div>
            </div>
          ))}
        </div>
        <Link
          href="/portal/requests"
          className="btn btn-outline btn-sm"
          style={{ marginTop: 16 }}
        >
          ← All requests
        </Link>
      </div>
    </>
  );
}
