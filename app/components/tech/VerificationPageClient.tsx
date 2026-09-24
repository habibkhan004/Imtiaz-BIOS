"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadVerificationItem,
  TECH_CHANGE_EVENT,
  type VerificationItem,
} from "../../lib/tech-data";
import { VerificationForm } from "./VerificationForm";
import { StatusBadge, TechPageHeader } from "./ui";

export function VerificationPageClient({
  seed,
  requestId,
}: {
  seed: VerificationItem;
  requestId: string;
}) {
  const [item, setItem] = useState(seed);

  useEffect(() => {
    const sync = () => {
      const live = loadVerificationItem(seed.id) ?? loadVerificationItem(requestId);
      if (live) setItem(live);
    };
    sync();
    window.addEventListener(TECH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(TECH_CHANGE_EVENT, sync);
  }, [seed.id, requestId]);

  return (
    <>
      <TechPageHeader
        title={`Verify ${item.filename}`}
        description="Inspect metadata, hex stub, and mark the dump verified, needs changes, or rejected."
      />
      <div className="portal-grid-2">
        <div>
          <div className="portal-panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <h2 style={{ marginBottom: 0 }}>{item.filename}</h2>
              <StatusBadge status={item.status} />
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              {item.model} · {item.brand} · {item.type}
            </p>
            <p style={{ fontSize: 14, marginTop: 10 }}>
              Size: <strong>{item.size}</strong>
              <br />
              Uploaded by: <strong>{item.uploadedBy}</strong>
              <br />
              Submitted: <strong>{item.submittedAt}</strong>
              <br />
              Linked request:{" "}
              <Link
                href={`/tech/review/${item.requestId}`}
                style={{ color: "var(--accent-cyan)" }}
              >
                {item.requestId}
              </Link>
            </p>
          </div>
          <div className="portal-panel">
            <h2>Simulated preview</h2>
            <pre
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--accent-cyan)",
                background: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                padding: 14,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {item.hexStub}
            </pre>
            <p className="form-note" style={{ marginTop: 12 }}>
              Demo hex stub only — not a real binary viewer.
            </p>
          </div>
        </div>
        <VerificationForm item={item} />
      </div>
    </>
  );
}
