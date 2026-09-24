"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadAssignedRequest,
  TECH_CHANGE_EVENT,
  typeLabel,
  type TechAssignedRequest,
} from "../../lib/tech-data";
import { StatusBadge } from "./ui";

export function RequestSummaryCard({ item: seed }: { item: TechAssignedRequest }) {
  const [item, setItem] = useState(seed);

  useEffect(() => {
    const sync = () => {
      const live = loadAssignedRequest(seed.id);
      if (live) setItem(live);
    };
    sync();
    window.addEventListener(TECH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(TECH_CHANGE_EVENT, sync);
  }, [seed.id]);

  return (
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
        <h2 style={{ marginBottom: 0 }}>
          {item.id} · {item.model}
        </h2>
        <StatusBadge status={item.status} />
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 12 }}>
        {typeLabel(item.type)} · {item.brand} · Priority {item.priority}
      </p>
      <p style={{ fontSize: 14, marginBottom: 8 }}>
        <strong>{item.customerName}</strong> · {item.customerEmail}
      </p>
      {item.typeNeeded ? (
        <p style={{ fontSize: 14, marginBottom: 8 }}>
          Needed: <strong>{item.typeNeeded}</strong>
        </p>
      ) : null}
      {item.subject ? (
        <p style={{ fontSize: 14, marginBottom: 8 }}>
          Subject: <strong>{item.subject}</strong>
        </p>
      ) : null}
      <p style={{ fontSize: 14, marginBottom: 14 }}>{item.customerNotes}</p>
      {item.attachments.length > 0 ? (
        <div style={{ marginBottom: 14 }}>
          <span className="eyebrow">ATTACHMENTS</span>
          <ul style={{ marginTop: 8, paddingLeft: 18, color: "var(--text-secondary)" }}>
            {item.attachments.map((a) => (
              <li key={a.name}>
                {a.name} ({a.size})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="action-btns">
        <Link href={`/tech/review/${item.id}`} className="btn btn-success btn-sm">
          Review
        </Link>
        {item.type === "upload" ? (
          <Link
            href={`/tech/verification/${item.id}`}
            className="btn btn-primary btn-sm"
          >
            Verify
          </Link>
        ) : null}
        <Link href={`/tech/notes/${item.id}`} className="btn btn-purple btn-sm">
          Notes
        </Link>
        <Link
          href={`/tech/requests/${item.id}/status`}
          className="btn btn-gold btn-sm"
        >
          Status
        </Link>
        <Link href={`/tech/messages/${item.id}`} className="btn btn-success btn-sm">
          Messages
        </Link>
      </div>
    </div>
  );
}
